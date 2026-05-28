from app.schemas.candidate import Candidate
from app.schemas.jd import JobDescription
from app.schemas.rubric import Rubric
from app.schemas.ranking import PairwiseResult
from app.utils.llm_client import call_llm_with_json_retry
from app.utils.prompts import PAIRWISE_COMPARISON_SYSTEM, PAIRWISE_COMPARISON_USER
from app.utils.elo import update_elo
from app.utils.logger import logger
import random

def generate_tournament_schedule(candidates: list[Candidate], max_matches_per_candidate: int = 10) -> list[tuple[Candidate, Candidate]]:
    """Generates a balanced set of matchups so every candidate plays approximately equal matches."""
    pairs = []
    n = len(candidates)
    if n < 2:
        return []
        
    # For small pools, do full round-robin
    if n <= 8:
        for i in range(n):
            for j in range(i + 1, n):
                pairs.append((candidates[i], candidates[j]))
        return pairs
        
    # For larger pools, sample matches to keep under rate limits
    # We want each candidate to participate in up to max_matches_per_candidate matches
    match_counts = {c.id: 0 for c in candidates}
    all_possible_pairs = []
    for i in range(n):
        for j in range(i + 1, n):
            all_possible_pairs.append((candidates[i], candidates[j]))
            
    # Shuffle for fairness
    random.shuffle(all_possible_pairs)
    
    selected_pairs = []
    for a, b in all_possible_pairs:
        if match_counts[a.id] < max_matches_per_candidate or match_counts[b.id] < max_matches_per_candidate:
            selected_pairs.append((a, b))
            match_counts[a.id] += 1
            match_counts[b.id] += 1
            
    logger.info(f"Generated tournament schedule: {len(selected_pairs)} matchups for {n} candidates.")
    return selected_pairs

def run_pairwise_match(
    a: Candidate,
    b: Candidate,
    jd: JobDescription,
    rubric: Rubric
) -> PairwiseResult:
    """Invokes LLM (Groq LLaMA 70B) to decide the winner between two candidates."""
    logger.info(f"Tournament Matchup: {a.name} VS {b.name}")
    
    rubric_summary = "\n".join([
        f"- {d.name}: {d.description}" for d in rubric.dimensions
    ])
    
    prompt = PAIRWISE_COMPARISON_USER.format(
        jd_title=jd.title,
        rubric_summary=rubric_summary,
        candidate_a_text=a.raw_text,
        candidate_b_text=b.raw_text
    )
    
    try:
        # Groq LLaMA 3.1 70B handles comparative reasoning
        parsed_json = call_llm_with_json_retry(
            prompt=prompt,
            system_prompt=PAIRWISE_COMPARISON_SYSTEM,
            use_groq=True,  # Groq client
            retries=3
        )
        
        winner_id_raw = str(parsed_json.get("winner_id", "candidate_a")).lower()
        if "candidate_b" in winner_id_raw or winner_id_raw == b.id:
            winner_id = b.id
        else:
            winner_id = a.id
            
        result = PairwiseResult(
            candidate_a_id=a.id,
            candidate_b_id=b.id,
            winner_id=winner_id,
            rationale=str(parsed_json.get("rationale", "No explanation provided.")),
            deciding_dimension=str(parsed_json.get("deciding_dimension", "Rubric Alignment")),
            confidence=parsed_json.get("confidence", "Medium")
        )
        logger.info(f"Match Winner: {a.name if winner_id == a.id else b.name} (decided by {result.deciding_dimension})")
        return result
        
    except Exception as e:
        logger.error(f"Error during matchup {a.name} vs {b.name}: {e}")
        # Default fallback to deterministic winner (higher years of experience or name string comparison)
        winner_id = a.id if a.experience_years >= b.experience_years else b.id
        return PairwiseResult(
            candidate_a_id=a.id,
            candidate_b_id=b.id,
            winner_id=winner_id,
            rationale="Fallback comparison based on experience years due to API failure.",
            deciding_dimension="Years of Experience",
            confidence="Low"
        )

def run_tournament(
    candidates: list[Candidate],
    jd: JobDescription,
    rubric: Rubric,
    k_factor: int = 24
) -> dict[str, float]:
    """Runs a pairwise tournament among candidates and returns their final Elo ratings."""
    logger.info("Initializing Elo ratings at 1500...")
    ratings = {c.id: 1500.0 for c in candidates}
    
    # Bound the candidate tournament pool size to Top-20 as per spec
    tournament_pool = candidates[:20]
    if len(tournament_pool) < 2:
        logger.warning("Not enough candidates for pairwise tournament.")
        return ratings
        
    schedule = generate_tournament_schedule(tournament_pool, max_matches_per_candidate=10)
    
    for a, b in schedule:
        # Get current ratings
        rating_a = ratings[a.id]
        rating_b = ratings[b.id]
        
        # Run matchup
        result = run_pairwise_match(a, b, jd, rubric)
        
        # Determine winner keyword for Elo update
        winner = "candidate_a" if result.winner_id == a.id else "candidate_b"
        
        # Update ratings
        new_a, new_b = update_elo(rating_a, rating_b, winner, k=k_factor)
        
        ratings[a.id] = round(new_a, 2)
        ratings[b.id] = round(new_b, 2)
        
    logger.info("Pairwise Elo tournament complete. Final Ratings:")
    for c_id, rating in sorted(ratings.items(), key=lambda x: x[1], reverse=True):
        candidate_name = next((cand.name for cand in candidates if cand.id == c_id), "Unknown")
        logger.info(f" - {candidate_name}: {rating}")
        
    return ratings
