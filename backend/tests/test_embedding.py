import pytest
from app.schemas.jd import JobDescription
from app.schemas.candidate import Candidate
from app.services.embedding_service import compute_semantic_shortlist

def test_semantic_shortlist():
    jd = JobDescription(
        title="ML Engineer",
        required_skills=["Python", "PyTorch"],
        min_experience_years=3,
        responsibilities=["Train neural networks for computer vision"],
        raw_text="Job Description"
    )
    
    c1 = Candidate(
        id="c1", name="Alice", current_role="Data Scientist",
        experience_years=3.0, skills=["Python"], summary="Traditional ML and statistical modeling", raw_text="Traditional ML and statistical modeling with Python"
    )
    c2 = Candidate(
        id="c2", name="Bob", current_role="Deep Learning Engineer",
        experience_years=3.0, skills=["PyTorch", "Python"], summary="Trains deep convolutional neural networks for image classification and segmentation", raw_text="Trains deep convolutional neural networks for image classification and segmentation with PyTorch"
    )
    
    # Run shortlist
    shortlist = compute_semantic_shortlist(jd, [c1, c2], top_k=2)
    
    assert len(shortlist) == 2
    # Bob is CV / PyTorch specific, so he should have a higher semantic similarity score than Alice (traditional ML)
    assert shortlist[0].candidate.name == "Bob"
    assert shortlist[0].semantic_score >= shortlist[1].semantic_score
