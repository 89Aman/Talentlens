from app.schemas.candidate import Candidate
from app.schemas.ranking import BehavioralScore
from app.utils.logger import logger
from typing import Literal

def compute_confidence(
    candidate: Candidate,
    behavioral_score: BehavioralScore,
    elo_score: float,
    elo_gap_to_next: float = 50.0
) -> Literal["High", "Medium", "Low"]:
    """Computes candidate confidence level (High/Medium/Low) based on data completeness, evidence density, and Elo separation."""
    logger.info(f"Computing confidence score for candidate: {candidate.name}")
    
    # 1. Profile completeness check
    word_count = len(candidate.raw_text.split())
    achievements_count = len(candidate.achievements)
    
    # Flags for low confidence
    is_sparse = (word_count < 80) or (achievements_count == 0) or (candidate.experience_years <= 0)
    
    # 2. Check Elo rating rules
    # - High confidence: Elo > 1550 and gap > 30 (from spec)
    # - Medium confidence: Elo between 1480 and 1550
    # - Low confidence: Elo < 1480 or gap < 10, or sparse profile
    if is_sparse:
        logger.info(f"Candidate {candidate.name} has sparse profile (Words: {word_count}, Achievements: {achievements_count}). Flagging Low confidence.")
        return "Low"
        
    if elo_score < 1480 or elo_gap_to_next < 10:
        logger.info(f"Candidate {candidate.name} has low Elo ({elo_score}) or narrow rating gap ({elo_gap_to_next}). Flagging Low confidence.")
        return "Low"
        
    if elo_score > 1550 and elo_gap_to_next > 30:
        logger.info(f"Candidate {candidate.name} has strong Elo ({elo_score}) and clear gap ({elo_gap_to_next}). Flagging High confidence.")
        return "High"
        
    logger.info(f"Candidate {candidate.name} maps to Medium confidence.")
    return "Medium"
