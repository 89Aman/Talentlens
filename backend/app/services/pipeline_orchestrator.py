import time
from app.schemas.candidate import Candidate
from app.schemas.jd import JobDescription
from app.schemas.ranking import RankedCandidate
from app.services.jd_parser import parse_jd
from app.services.rubric_generator import generate_rubric
from app.services.hard_filter import apply_hard_filters
from app.services.embedding_service import compute_semantic_shortlist
from app.services.behavioral_scorer import score_candidate_behavioral
from app.services.pairwise_ranker import run_tournament
from app.services.confidence_engine import compute_confidence
from app.services.brief_generator import generate_hiring_brief
from app.utils.logger import logger

def run_ranking_pipeline(
    jd: JobDescription,
    raw_candidates: list[Candidate],
    top_k_shortlist: int = 50,
    top_k_final: int = 10
) -> dict:
    """Executes the full 5-layer candidate ranking pipeline, returning structured results and metadata."""
    logger.info("Starting candidate ranking pipeline execution...")
    start_time = time.time()
    
    # Layer 1: Dynamic Rubric Generation
    rubric = generate_rubric(jd)
    
    # Layer 2: Deterministic Hard Filter
    passed_candidates, rejected_records = apply_hard_filters(raw_candidates, jd)
    
    if not passed_candidates:
        logger.warning("No candidates passed hard filters. Pipeline terminating early.")
        return {
            "job_title": jd.title,
            "rubric": rubric.model_dump(),
            "ranked_candidates": [],
            "rejected_candidates": [r.model_dump() for r in rejected_records],
            "metadata": {
                "total_candidates": len(raw_candidates),
                "filtered_out": len(rejected_records),
                "shortlisted": 0,
                "final_ranked": 0,
                "pipeline_duration_seconds": round(time.time() - start_time, 2)
            }
        }
        
    # Layer 3: Semantic Retrieval (FAISS)
    # Get Top-K matches based on semantic similarity
    semantic_scores_map = {}
    semantic_shortlist = compute_semantic_shortlist(jd, passed_candidates, top_k=top_k_shortlist)
    shortlisted_candidates = []
    for c_score in semantic_shortlist:
        shortlisted_candidates.append(c_score.candidate)
        semantic_scores_map[c_score.candidate.id] = c_score.semantic_score
        
    # Layer 4: Behavioral Signal Scoring
    behavioral_scores = {}
    logger.info(f"Scoring behavioral signals for {len(shortlisted_candidates)} shortlisted candidates...")
    for candidate in shortlisted_candidates:
        score_obj = score_candidate_behavioral(candidate, jd, rubric)
        behavioral_scores[candidate.id] = score_obj
        
    # Select Top-20 for pairwise re-ranking based on behavioral scores descending
    # (using semantic score as a tie-breaker)
    shortlisted_candidates.sort(
        key=lambda c: (
            behavioral_scores.get(c.id).final_behavioral_score if c.id in behavioral_scores else 50,
            semantic_scores_map.get(c.id, 0.0)
        ),
        reverse=True
    )
    
    tournament_pool = shortlisted_candidates[:20]
    
    # Layer 5: Pairwise Elo Re-ranking
    elo_ratings = run_tournament(tournament_pool, jd, rubric)
    
    # Sort tournament pool based on final Elo rating
    tournament_pool.sort(
        key=lambda c: elo_ratings.get(c.id, 1500.0),
        reverse=True
    )
    
    # Layer 6: Confidence Labeling & Hiring Brief Generation for finalists
    ranked_candidates = []
    finalist_pool = tournament_pool[:top_k_final]
    
    logger.info(f"Generating confidence labels and hiring briefs for Top-{len(finalist_pool)} finalists...")
    for rank_idx, candidate in enumerate(finalist_pool):
        # Calculate Elo rating and gap to next candidate for confidence calculation
        elo_score = elo_ratings.get(candidate.id, 1500.0)
        if rank_idx < len(finalist_pool) - 1:
            next_candidate = finalist_pool[rank_idx + 1]
            elo_gap = elo_score - elo_ratings.get(next_candidate.id, 1500.0)
        else:
            elo_gap = 50.0 # Default fallback gap for last candidate
            
        behavior_score_obj = behavioral_scores.get(candidate.id)
        
        # Calculate confidence
        confidence = compute_confidence(
            candidate=candidate,
            behavioral_score=behavior_score_obj,
            elo_score=elo_score,
            elo_gap_to_next=elo_gap
        )
        
        # Generate Brief
        brief = generate_hiring_brief(candidate, jd, rubric, behavior_score_obj)
        
        ranked_candidates.append({
            "rank": rank_idx + 1,
            "candidate_id": candidate.id,
            "name": candidate.name,
            "current_role": candidate.current_role,
            "experience_years": candidate.experience_years,
            "skills": candidate.skills,
            "summary": candidate.summary,
            "achievements": candidate.achievements,
            "raw_text": candidate.raw_text,
            "semantic_score": semantic_scores_map.get(candidate.id, 0.5),
            "behavioral_score": behavior_score_obj.final_behavioral_score,
            "elo_score": elo_score,
            "confidence": confidence,
            "fit_summary": brief["fit_summary"],
            "gap_summary": brief["gap_summary"],
            "interview_question": brief["interview_question"],
            "behavioral_breakdown": {
                "quantified_impact": {
                    "score": behavior_score_obj.quantified_impact_score,
                    "evidence": behavior_score_obj.quantified_impact_evidence
                },
                "ownership": {
                    "score": behavior_score_obj.ownership_scope_score,
                    "evidence": behavior_score_obj.ownership_scope_evidence
                },
                "technical_depth": {
                    "score": behavior_score_obj.trajectory_velocity_score,
                    "evidence": behavior_score_obj.trajectory_velocity_evidence
                },
                "mentorship": {
                    "score": behavior_score_obj.rubric_alignment_score,
                    "evidence": behavior_score_obj.rubric_alignment_evidence
                }
            }
        })
        
    duration = round(time.time() - start_time, 2)
    logger.info(f"Pipeline execution finished in {duration} seconds.")
    
    return {
        "job_title": jd.title,
        "rubric": rubric.model_dump(),
        "ranked_candidates": ranked_candidates,
        "rejected_candidates": [
            {
                "candidate_id": r.candidate_id,
                "name": r.candidate_name,
                "reason": r.reason
            }
            for r in rejected_records
        ],
        "metadata": {
            "total_candidates": len(raw_candidates),
            "filtered_out": len(rejected_records),
            "shortlisted": len(shortlisted_candidates),
            "final_ranked": len(ranked_candidates),
            "pipeline_duration_seconds": duration
        }
    }
