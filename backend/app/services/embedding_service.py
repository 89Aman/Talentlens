import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from app.schemas.jd import JobDescription
from app.schemas.candidate import Candidate
from app.schemas.ranking import CandidateScore
from app.utils.logger import logger

# Lazy load model to speed up startup times
_model = None

def get_embedding_model() -> SentenceTransformer:
    global _model
    if _model is None:
        logger.info("Loading sentence-transformers/all-MiniLM-L6-v2 model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def compute_semantic_shortlist(
    jd: JobDescription,
    candidates: list[Candidate],
    top_k: int = 50
) -> list[CandidateScore]:
    """Generates embeddings, builds FAISS index, and retrieves Top-K semantically matching candidates."""
    logger.info(f"Computing semantic shortlist for {len(candidates)} candidates (Target Top-K: {top_k})...")
    
    if not candidates:
        logger.warning("No candidates provided for semantic retrieval.")
        return []
        
    try:
        model = get_embedding_model()
        
        # 1. Embed Job Description
        # Combine title, required/preferred skills, and responsibilities for richer context
        jd_text = f"Role: {jd.title}\nSkills Required: {', '.join(jd.required_skills)}\nSkills Preferred: {', '.join(jd.preferred_skills)}\nResponsibilities: {' '.join(jd.responsibilities)}"
        logger.info("Embedding Job Description...")
        jd_embedding = model.encode([jd_text], show_progress_bar=False)
        jd_vector = np.array(jd_embedding).astype('float32')
        
        # 2. Embed Candidates
        logger.info(f"Embedding {len(candidates)} candidate profiles...")
        candidate_texts = [c.raw_text for c in candidates]
        candidate_embeddings = model.encode(candidate_texts, show_progress_bar=False)
        candidate_vectors = np.array(candidate_embeddings).astype('float32')
        
        # Normalize vectors for cosine similarity
        faiss.normalize_L2(jd_vector)
        faiss.normalize_L2(candidate_vectors)
        
        # 3. Create FAISS index and perform search
        dimension = candidate_vectors.shape[1]
        # IndexFlatIP is inner product (cosine similarity since vectors are normalized)
        index = faiss.IndexFlatIP(dimension)
        index.add(candidate_vectors)
        
        # Perform query
        k = min(top_k, len(candidates))
        scores, indices = index.search(jd_vector, k)
        
        # 4. Map results back to CandidateScore
        shortlisted = []
        for i in range(k):
            score = float(scores[0][i])
            idx = int(indices[0][i])
            
            # Bound score between 0.0 and 1.0 (should be already, but safety first)
            bounded_score = max(0.0, min(1.0, score))
            
            shortlisted.append(
                CandidateScore(
                    candidate=candidates[idx],
                    semantic_score=round(bounded_score, 4)
                )
            )
            
        # Sort by score descending (FAISS IndexFlatIP search already sorts descending)
        logger.info(f"Successfully retrieved Top-{k} candidates via semantic similarity.")
        return shortlisted
        
    except Exception as e:
        logger.error(f"Error during semantic retrieval: {e}")
        # Fallback to simple sorting based on alphabetical or index if embeddings fail
        fallback_list = []
        for idx, c in enumerate(candidates[:top_k]):
            fallback_list.append(CandidateScore(candidate=c, semantic_score=0.5))
        return fallback_list
