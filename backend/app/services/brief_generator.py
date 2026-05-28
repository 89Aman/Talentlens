from app.schemas.candidate import Candidate
from app.schemas.jd import JobDescription
from app.schemas.rubric import Rubric
from app.schemas.ranking import BehavioralScore
from app.utils.llm_client import call_llm_with_json_retry
from app.utils.prompts import HIRING_BRIEF_SYSTEM, HIRING_BRIEF_USER
from app.utils.logger import logger

def generate_hiring_brief(
    candidate: Candidate,
    jd: JobDescription,
    rubric: Rubric,
    behavioral_score: BehavioralScore
) -> dict:
    """Generates a recruiter ready hiring brief (fit, gap, interview question) using Gemini 1.5 Flash."""
    logger.info(f"Generating candidate hiring brief for finalist: {candidate.name}")
    
    rubric_summary = "\n".join([
        f"- {d.name}: {d.description}" for d in rubric.dimensions
    ])
    
    prompt = HIRING_BRIEF_USER.format(
        jd_title=jd.title,
        rubric_summary=rubric_summary,
        candidate_text=candidate.raw_text,
        behavioral_summary=behavioral_score.summary
    )
    
    try:
        parsed_json = call_llm_with_json_retry(
            prompt=prompt,
            system_prompt=HIRING_BRIEF_SYSTEM,
            use_groq=False,  # Gemini Flash is standard
            retries=3
        )
        
        # Verify formatting constraints
        fit_summary = str(parsed_json.get("fit_summary", "Candidate displays solid technical alignment.")).strip()
        gap_summary = str(parsed_json.get("gap_summary", "Review required on active system design depth.")).strip()
        interview_question = str(parsed_json.get("interview_question", "Can you explain how you would scale your neural network models?")).strip()
        
        # Ensure question format
        if not interview_question.endswith("?"):
            interview_question += "?"
            
        return {
            "fit_summary": fit_summary,
            "gap_summary": gap_summary,
            "interview_question": interview_question
        }
        
    except Exception as e:
        logger.error(f"Failed to generate hiring brief for candidate {candidate.name}: {e}")
        # Default recruiter brief
        return {
            "fit_summary": f"Strong alignment in {candidate.current_role} with {candidate.experience_years} years experience.",
            "gap_summary": "Verification of specific achievements and technical depth required.",
            "interview_question": f"Can you detail your primary contribution in your role as a {candidate.current_role}?"
        }
