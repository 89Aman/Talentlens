from app.schemas.jd import JobDescription
from app.utils.llm_client import call_llm_with_json_retry
from app.utils.prompts import JD_EXTRACTION_SYSTEM, JD_EXTRACTION_USER
from app.utils.logger import logger

def parse_jd(jd_text: str) -> JobDescription:
    """Parses raw JD text into a structured JobDescription model using Gemini 1.5 Flash."""
    logger.info("Parsing raw Job Description text...")
    
    prompt = JD_EXTRACTION_USER.format(jd_text=jd_text)
    
    try:
        parsed_json = call_llm_with_json_retry(
            prompt=prompt,
            system_prompt=JD_EXTRACTION_SYSTEM,
            use_groq=False,  # Use Gemini Flash as per specs
            retries=3
        )
        
        # Merge with raw text
        parsed_json["raw_text"] = jd_text
        
        # Build JobDescription object
        jd = JobDescription(**parsed_json)
        logger.info(f"Successfully parsed job description for role: {jd.title}")
        return jd
        
    except Exception as e:
        logger.error(f"Failed to parse job description: {e}")
        # Fallback to a basic parsed structure if LLM fails completely
        return JobDescription(
            title="Unknown Role",
            required_skills=[],
            preferred_skills=[],
            min_experience_years=0,
            responsibilities=[],
            culture_signals=[],
            raw_text=jd_text
        )
