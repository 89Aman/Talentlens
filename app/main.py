import io
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from app.schemas.jd import JobDescription
from app.schemas.candidate import Candidate
from app.schemas.rubric import Rubric
from app.services.jd_parser import parse_jd
from app.services.rubric_generator import generate_rubric
from app.services.resume_parser import normalize_candidate_row, load_candidates_from_csv
from app.services.behavioral_scorer import score_candidate_behavioral
from app.services.pipeline_orchestrator import run_ranking_pipeline
from app.utils.logger import logger

app = FastAPI(
    title="TalentLens AI Candidate Ranking System API",
    description="Multi-stage intelligent candidate ranking engine using semantic retrieval and Elo re-ranking.",
    version="1.0.0"
)

# CORS middleware for stream UI integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schemas for JSON endpoints
class RubricRequest(BaseModel):
    jd_text: str

class ParseJDRequest(BaseModel):
    jd_text: str

class ScoreCandidateRequest(BaseModel):
    candidate: dict
    jd_text: str
    rubric: dict


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}


@app.post("/parse-jd", status_code=status.HTTP_200_OK)
def parse_job_description(request: ParseJDRequest):
    """Parses raw job description text into structured JSON fields using Gemini."""
    try:
        jd_obj = parse_jd(request.jd_text)
        return jd_obj.model_dump()
    except Exception as e:
        logger.error(f"Error in /parse-jd: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "parse_failed", "detail": str(e), "stage": "jd_parsing"}
        )


@app.post("/rubric", status_code=status.HTTP_200_OK)
def generate_role_rubric(request: RubricRequest):
    """Generates a dynamic 4-6 dimension evaluation rubric from job description text."""
    try:
        jd_obj = parse_jd(request.jd_text)
        rubric_obj = generate_rubric(jd_obj)
        return rubric_obj.model_dump()
    except Exception as e:
        logger.error(f"Error in /rubric: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "rubric_failed", "detail": str(e), "stage": "rubric_generation"}
        )


@app.post("/score-candidate", status_code=status.HTTP_200_OK)
def score_candidate(request: ScoreCandidateRequest):
    """Scores a single candidate behavioral profile against a rubric."""
    try:
        # Load models from input dicts
        candidate_obj = Candidate(**request.candidate)
        jd_obj = parse_jd(request.jd_text)
        rubric_obj = Rubric(**request.rubric)
        
        score_obj = score_candidate_behavioral(candidate_obj, jd_obj, rubric_obj)
        return score_obj.model_dump()
    except Exception as e:
        logger.error(f"Error in /score-candidate: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "scoring_failed", "detail": str(e), "stage": "candidate_scoring"}
        )


@app.post("/rank", status_code=status.HTTP_200_OK)
async def rank_candidates(
    jd_text: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
    candidates_file: UploadFile = File(...),
    top_k_shortlist: int = Form(50),
    top_k_final: int = Form(10)
):
    """Executes the full 5-layer ranking pipeline on uploaded datasets."""
    logger.info("Received ranking pipeline request.")
    
    # 1. Extract Job Description text
    final_jd_text = ""
    if jd_file:
        try:
            content = await jd_file.read()
            final_jd_text = content.decode("utf-8")
        except Exception as e:
            logger.error(f"Failed to read JD file: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "invalid_jd_file", "detail": "Could not read uploaded JD file.", "stage": "ingestion"}
            )
    elif jd_text:
        final_jd_text = jd_text
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "missing_jd", "detail": "Either jd_text or jd_file must be provided.", "stage": "ingestion"}
        )
        
    # 2. Parse candidates CSV
    import pandas as pd
    try:
        content = await candidates_file.read()
        df = pd.read_csv(io.BytesIO(content))
        # Handle NaN values
        df = df.fillna("")
        
        candidates = []
        for idx, row in df.iterrows():
            cand = normalize_candidate_row(row.to_dict(), idx)
            candidates.append(cand)
            
        logger.info(f"Loaded {len(candidates)} candidates from upload.")
    except Exception as e:
        logger.error(f"Failed to parse candidate CSV: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "invalid_csv_file", "detail": f"Could not parse candidates CSV: {str(e)}", "stage": "ingestion"}
        )
        
    # 3. Parse Job Description using Gemini
    try:
        jd_obj = parse_jd(final_jd_text)
    except Exception as e:
        logger.error(f"Failed to parse job description: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "jd_parsing_failed", "detail": str(e), "stage": "jd_parsing"}
        )
        
    # 4. Run ranking pipeline
    try:
        results = run_ranking_pipeline(
            jd=jd_obj,
            raw_candidates=candidates,
            top_k_shortlist=top_k_shortlist,
            top_k_final=top_k_final
        )
        return results
    except Exception as e:
        logger.error(f"Pipeline execution crashed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "pipeline_crashed", "detail": str(e), "stage": "pipeline_execution"}
        )
