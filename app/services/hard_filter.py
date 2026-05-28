from app.schemas.jd import JobDescription
from app.schemas.candidate import Candidate
from app.schemas.ranking import FilteredOut
from app.utils.logger import logger

def apply_hard_filters(
    candidates: list[Candidate],
    jd: JobDescription
) -> tuple[list[Candidate], list[FilteredOut]]:
    """Applies rule-based experience and skill filters to the candidate pool."""
    logger.info("Applying hard filters...")
    
    passed_candidates = []
    rejected_candidates = []
    
    min_exp = jd.min_experience_years
    required_skills = [s.lower().strip() for s in jd.required_skills if s.strip()]
    
    logger.info(f"Criteria: Min Experience = {min_exp} years, Required Skills = {required_skills}")
    
    for candidate in candidates:
        # 1. Experience Years Filter
        if candidate.experience_years < min_exp:
            reason = f"Experience below minimum: candidate has {candidate.experience_years} years, required {min_exp}"
            logger.info(f"Rejected {candidate.name}: {reason}")
            rejected_candidates.append(
                FilteredOut(
                    candidate_id=candidate.id,
                    candidate_name=candidate.name,
                    reason=reason,
                    filter_type="experience"
                )
            )
            continue
            
        # 2. Required Skills Filter (Case-insensitive substring search)
        candidate_skills_lower = [s.lower().strip() for s in candidate.skills]
        # Concat with summary or roles just in case skills section is sparse
        candidate_text_lower = (
            " ".join(candidate_skills_lower) + " " + 
            candidate.summary.lower() + " " + 
            " ".join([a.lower() for a in candidate.achievements])
        )
        
        missing_skills = []
        for req_skill in required_skills:
            # Check if required skill is in the candidate's skills or text
            found = False
            for cand_skill in candidate_skills_lower:
                if req_skill in cand_skill or cand_skill in req_skill:
                    found = True
                    break
            if not found and req_skill not in candidate_text_lower:
                missing_skills.append(req_skill)
                
        if missing_skills:
            reason = f"Missing mandatory skills: {', '.join(missing_skills)}"
            logger.info(f"Rejected {candidate.name}: {reason}")
            rejected_candidates.append(
                FilteredOut(
                    candidate_id=candidate.id,
                    candidate_name=candidate.name,
                    reason=reason,
                    filter_type="skills"
                )
            )
            continue
            
        passed_candidates.append(candidate)
        
    logger.info(f"Filter complete. Passed: {len(passed_candidates)}, Rejected: {len(rejected_candidates)}")
    return passed_candidates, rejected_candidates
