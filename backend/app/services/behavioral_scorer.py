from app.schemas.candidate import Candidate
from app.schemas.jd import JobDescription
from app.schemas.rubric import Rubric
from app.schemas.ranking import BehavioralScore
from app.utils.llm_client import call_llm_with_json_retry
from app.utils.prompts import BEHAVIORAL_SCORING_SYSTEM, BEHAVIORAL_SCORING_USER
from app.utils.logger import logger

def score_candidate_behavioral(
    candidate: Candidate,
    jd: JobDescription,
    rubric: Rubric
) -> BehavioralScore:
    """Scores candidate achievements, ownership, trajectory, and rubric alignment using Gemini Flash."""
    logger.info(f"Scoring behavioral signals for candidate: {candidate.name}")
    
    # Construct rubric summary
    rubric_summary = "\n".join([
        f"- {d.name} (weight: {d.weight:.2f}): {d.description}. Scoring guide: {d.scoring_guide}"
        for d in rubric.dimensions
    ])
    
    prompt = BEHAVIORAL_SCORING_USER.format(
        jd_title=jd.title,
        rubric_summary=rubric_summary,
        candidate_text=candidate.raw_text
    )
    
    try:
        parsed_json = call_llm_with_json_retry(
            prompt=prompt,
            system_prompt=BEHAVIORAL_SCORING_SYSTEM,
            use_groq=False,  # Gemini Flash is standard for scorer
            retries=3
        )
        
        # Build score model safely with defaults
        score = BehavioralScore(
            candidate_id=candidate.id,
            quantified_impact_score=int(parsed_json.get("quantified_impact_score", 50)),
            quantified_impact_evidence=str(parsed_json.get("quantified_impact_evidence", "No explicit metrics listed.")),
            ownership_scope_score=int(parsed_json.get("ownership_scope_score", 50)),
            ownership_scope_evidence=str(parsed_json.get("ownership_scope_evidence", "No clear scope metrics.")),
            trajectory_velocity_score=int(parsed_json.get("trajectory_velocity_score", 50)),
            trajectory_velocity_evidence=str(parsed_json.get("trajectory_velocity_evidence", "No tenure trends.")),
            rubric_alignment_score=int(parsed_json.get("rubric_alignment_score", 50)),
            rubric_alignment_evidence=str(parsed_json.get("rubric_alignment_evidence", "No distinct mapping.")),
            final_behavioral_score=int(parsed_json.get("final_behavioral_score", 50)),
            summary=str(parsed_json.get("summary", f"Decent fit candidate {candidate.name}."))
        )
        
        logger.info(f"Candidate {candidate.name} scored behavioral: {score.final_behavioral_score}")
        return score
        
    except Exception as e:
        logger.error(f"Failed to score candidate {candidate.name}: {e}")
        # Build stable default fallback
        return BehavioralScore(
            candidate_id=candidate.id,
            quantified_impact_score=50,
            quantified_impact_evidence="Failed to parse LLM response.",
            ownership_scope_score=50,
            ownership_scope_evidence="Failed to parse LLM response.",
            trajectory_velocity_score=50,
            trajectory_velocity_evidence="Failed to parse LLM response.",
            rubric_alignment_score=50,
            rubric_alignment_evidence="Failed to parse LLM response.",
            final_behavioral_score=50,
            summary=f"Profile has baseline details for candidate {candidate.name}."
        )
