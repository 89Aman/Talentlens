from app.schemas.jd import JobDescription
from app.schemas.rubric import Rubric, RubricDimension
from app.utils.llm_client import call_llm_with_json_retry
from app.utils.prompts import RUBRIC_GENERATION_SYSTEM, RUBRIC_GENERATION_USER
from app.utils.logger import logger

def generate_rubric(jd: JobDescription) -> Rubric:
    """Generates a role-specific evaluation rubric (4-6 dimensions) with weights summing to 1.0."""
    logger.info(f"Generating dynamic evaluation rubric for role: {jd.title}")
    
    # Pre-summarize JD for prompt token budget
    jd_summary = f"Role: {jd.title}. Skills required: {', '.join(jd.required_skills)}. Key responsibilities: {' '.join(jd.responsibilities[:5])}"
    
    prompt = RUBRIC_GENERATION_USER.format(
        title=jd.title,
        jd_summary=jd_summary,
        required_skills=", ".join(jd.required_skills),
        responsibilities="\n".join([f"- {r}" for r in jd.responsibilities])
    )
    
    try:
        parsed_json = call_llm_with_json_retry(
            prompt=prompt,
            system_prompt=RUBRIC_GENERATION_SYSTEM,
            use_groq=False,  # Use Gemini Flash for rubric generation
            retries=3
        )
        
        dimensions = parsed_json.get("dimensions", [])
        if not dimensions or len(dimensions) < 4 or len(dimensions) > 6:
            # Fallback default dimensions if LLM output fails constraints
            logger.warning("LLM dimensions count mismatch. Applying default dimensions.")
            dimensions = [
                {"name": "Technical Capabilities", "weight": 0.30, "description": "Core tech stack depth", "scoring_guide": "Evidence of skills"},
                {"name": "Problem Solving & Ownership", "weight": 0.25, "description": "Complexity of systems built", "scoring_guide": "Led design"},
                {"name": "Impact & Quantified Wins", "weight": 0.25, "description": "Metrics and delivery", "scoring_guide": "Percentages or scale"},
                {"name": "Team & Communication", "weight": 0.20, "description": "Mentorship and collaboration", "scoring_guide": "Mentoring or cross-team"}
            ]
            
        # Normalize weights robustly to sum to exactly 1.0
        total_weight = sum(float(d.get("weight", 0.25)) for d in dimensions)
        if total_weight == 0:
            total_weight = len(dimensions)
            for d in dimensions:
                d["weight"] = 1.0 / total_weight
        else:
            for d in dimensions:
                d["weight"] = round(float(d.get("weight", 0.25)) / total_weight, 2)
                
        # Fix float rounding remainder
        diff = round(1.0 - sum(d["weight"] for d in dimensions), 2)
        if diff != 0 and dimensions:
            dimensions[0]["weight"] = round(dimensions[0]["weight"] + diff, 2)
            
        rubric_dims = [RubricDimension(**d) for d in dimensions]
        rubric = Rubric(
            dimensions=rubric_dims,
            generated_for=jd.title
        )
        
        logger.info(f"Rubric successfully generated with {len(rubric.dimensions)} dimensions.")
        for d in rubric.dimensions:
            logger.info(f" - {d.name} (weight: {d.weight})")
            
        return rubric
        
    except Exception as e:
        logger.error(f"Failed to generate dynamic rubric: {e}")
        # Build stable default rubric fallback
        fallback_dims = [
            RubricDimension(name="Technical Stack Match", weight=0.30, description="Core programming languages & libraries match", scoring_guide="Strong: >3 years with exact stack. Weak: basic knowledge."),
            RubricDimension(name="Execution & Ownership", weight=0.25, description="Evidence of independent delivery & architecture", scoring_guide="Strong: led systems, designed databases. Weak: task-taker."),
            RubricDimension(name="Quantified Results", weight=0.25, description="Measurable outcome delivery", scoring_guide="Strong: mentions %, scale, revenue. Weak: qualitative only."),
            RubricDimension(name="Communication & Team", weight=0.20, description="Cross-team alignment & mentorship", scoring_guide="Strong: mentored juniors, worked with PMs. Weak: individual contributor only.")
        ]
        return Rubric(dimensions=fallback_dims, generated_for=jd.title)
