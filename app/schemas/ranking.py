from pydantic import BaseModel, Field
from typing import Literal
from app.schemas.candidate import Candidate

class BehavioralScore(BaseModel):
    candidate_id: str = Field(..., description="Unique candidate ID")
    quantified_impact_score: int = Field(..., ge=0, le=100, description="Score for quantified impact (0-100)")
    quantified_impact_evidence: str = Field(..., description="Citations or quotes as evidence")
    ownership_scope_score: int = Field(..., ge=0, le=100, description="Score for ownership scope (0-100)")
    ownership_scope_evidence: str = Field(..., description="Citations or quotes as evidence")
    trajectory_velocity_score: int = Field(..., ge=0, le=100, description="Score for trajectory velocity (0-100)")
    trajectory_velocity_evidence: str = Field(..., description="Citations or quotes as evidence")
    rubric_alignment_score: int = Field(..., ge=0, le=100, description="Score for rubric alignment (0-100)")
    rubric_alignment_evidence: str = Field(..., description="Citations or quotes as evidence")
    final_behavioral_score: int = Field(..., ge=0, le=100, description="Composite behavioral score (0-100)")
    summary: str = Field(..., description="Short 2-sentence summary of candidate behavior signals")

class PairwiseResult(BaseModel):
    candidate_a_id: str = Field(..., description="ID of Candidate A")
    candidate_b_id: str = Field(..., description="ID of Candidate B")
    winner_id: str = Field(..., description="ID of the winner candidate ('candidate_a' or 'candidate_b')")
    rationale: str = Field(..., description="Explanation under 80 words")
    deciding_dimension: str = Field(..., description="Rubric dimension that was most decisive")
    confidence: Literal["High", "Medium", "Low"] = Field(..., description="LLM comparison confidence")

class RankedCandidate(BaseModel):
    rank: int = Field(..., description="Final sorted placement order")
    candidate: Candidate = Field(..., description="Full candidate model")
    semantic_score: float = Field(..., description="Cosine similarity semantic match (0.0 - 1.0)")
    behavioral_score: int = Field(..., description="Extracted behavioral score (0 - 100)")
    elo_score: float = Field(..., description="Final ratings score derived via Elo tournament")
    confidence: Literal["High", "Medium", "Low"] = Field(..., description="Calculated final confidence label")
    fit_summary: str = Field(..., description="1-2 sentences fit recruiter brief")
    gap_summary: str = Field(..., description="Key professional gap")
    interview_question: str = Field(..., description="Tailored candidate question")

class FilteredOut(BaseModel):
    candidate_id: str = Field(..., description="Unique candidate ID")
    candidate_name: str = Field(..., description="Candidate name")
    reason: str = Field(..., description="Explanation why candidate was filtered")
    filter_type: Literal["experience", "skills", "degree", "location"] = Field(..., description="Must-have condition type failed")

class CandidateScore(BaseModel):
    candidate: Candidate = Field(..., description="Candidate model")
    semantic_score: float = Field(..., description="Cosine similarity semantic match")
