import pytest
from unittest.mock import patch
from app.schemas.jd import JobDescription
from app.schemas.candidate import Candidate
from app.services.pipeline_orchestrator import run_ranking_pipeline

@pytest.fixture
def mock_jd():
    return JobDescription(
        title="Senior ML Engineer",
        required_skills=["Python", "PyTorch"],
        min_experience_years=3,
        responsibilities=["Train and deploy neural networks"],
        raw_text="Raw Job Description"
    )

@pytest.fixture
def mock_candidates():
    return [
        Candidate(
            id="c1", name="Alice", current_role="ML Engineer", experience_years=4.5,
            skills=["Python", "PyTorch"], summary="Experienced in model training",
            achievements=["Reduced training time by 30%"], raw_text="Experienced in model training with Python and PyTorch"
        ),
        Candidate(
            id="c2", name="Bob", current_role="Software Engineer", experience_years=2.0,
            skills=["Python"], summary="Writes backend services",
            achievements=["Optimized DB queries"], raw_text="Writes backend services with Python"
        ),
        Candidate(
            id="c3", name="Carol", current_role="Senior Deep Learning Engineer", experience_years=6.0,
            skills=["Python", "PyTorch", "MLOps"], summary="Builds production ML infrastructure",
            achievements=["Scaled inference serving to 10k RPS", "Mentored 3 junior engineers"],
            raw_text="Builds production ML infrastructure with Python, PyTorch, and MLOps"
        )
    ]

@patch("app.services.rubric_generator.call_llm_with_json_retry")
@patch("app.services.behavioral_scorer.call_llm_with_json_retry")
@patch("app.services.pairwise_ranker.call_llm_with_json_retry")
@patch("app.services.brief_generator.call_llm_with_json_retry")
def test_full_pipeline_orchestration(
    mock_brief_llm,
    mock_pairwise_llm,
    mock_behavioral_llm,
    mock_rubric_llm,
    mock_jd,
    mock_candidates
):
    # Setup mock rubric response
    mock_rubric_llm.return_value = {
        "dimensions": [
            {"name": "ML Depth", "weight": 0.30, "description": "PyTorch skills", "scoring_guide": "Guide"},
            {"name": "Ownership", "weight": 0.25, "description": "Led projects", "scoring_guide": "Guide"},
            {"name": "Impact", "weight": 0.25, "description": "Quantified wins", "scoring_guide": "Guide"},
            {"name": "Teamwork", "weight": 0.20, "description": "Collaboration", "scoring_guide": "Guide"}
        ]
    }
    
    # Setup mock behavioral score response
    mock_behavioral_llm.return_value = {
        "quantified_impact_score": 85,
        "quantified_impact_evidence": "Evidence of wins",
        "ownership_scope_score": 80,
        "ownership_scope_evidence": "Evidence of building",
        "trajectory_velocity_score": 75,
        "trajectory_velocity_evidence": "Promotions",
        "rubric_alignment_score": 80,
        "rubric_alignment_evidence": "Rubric evidence",
        "final_behavioral_score": 80,
        "summary": "Great fit candidate summary."
    }
    
    # Setup mock pairwise comparison response
    # We will pretend candidate_a always wins
    mock_pairwise_llm.return_value = {
        "winner_id": "candidate_a",
        "rationale": "Stronger evidence of production deployment",
        "deciding_dimension": "ML Depth",
        "confidence": "High"
    }
    
    # Setup mock brief response
    mock_brief_llm.return_value = {
        "fit_summary": "Fits well",
        "gap_summary": "Needs slight scaling verification",
        "interview_question": "Explain your model?"
    }
    
    # Execute full pipeline
    # Bob has only 2 years experience, so he should be filtered out because min_experience is 3!
    results = run_ranking_pipeline(
        jd=mock_jd,
        raw_candidates=mock_candidates,
        top_k_shortlist=5,
        top_k_final=2
    )
    
    # Verify results structure
    assert results["job_title"] == "Senior ML Engineer"
    assert len(results["rubric"]["dimensions"]) == 4
    
    # Bob should be in rejected_candidates because of experience years
    assert len(results["rejected_candidates"]) == 1
    assert results["rejected_candidates"][0]["candidate_id"] == "c2"
    assert "experience" in results["rejected_candidates"][0]["reason"].lower()
    
    # Alice and Carol should be in ranked_candidates
    assert len(results["ranked_candidates"]) == 2
    assert results["ranked_candidates"][0]["rank"] == 1
    assert results["ranked_candidates"][1]["rank"] == 2
    
    # Check that metadata matches
    assert results["metadata"]["total_candidates"] == 3
    assert results["metadata"]["filtered_out"] == 1
    assert results["metadata"]["shortlisted"] == 2
    assert results["metadata"]["final_ranked"] == 2
