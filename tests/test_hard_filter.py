import pytest
from app.schemas.jd import JobDescription
from app.schemas.candidate import Candidate
from app.services.hard_filter import apply_hard_filters

def test_hard_filter_experience():
    jd = JobDescription(
        title="Senior ML Engineer",
        required_skills=[],
        min_experience_years=5,
        responsibilities=[],
        raw_text="Job Description"
    )
    
    c1 = Candidate(
        id="c1", name="Alice", current_role="ML Engineer",
        experience_years=3.0, skills=[], summary="summary text", raw_text=""
    )
    c2 = Candidate(
        id="c2", name="Bob", current_role="ML Engineer",
        experience_years=6.5, skills=[], summary="summary text", raw_text=""
    )
    
    passed, rejected = apply_hard_filters([c1, c2], jd)
    
    assert len(passed) == 1
    assert passed[0].name == "Bob"
    assert len(rejected) == 1
    assert rejected[0].candidate_name == "Alice"
    assert rejected[0].filter_type == "experience"

def test_hard_filter_skills():
    jd = JobDescription(
        title="ML Engineer",
        required_skills=["Python", "PyTorch"],
        min_experience_years=0,
        responsibilities=[],
        raw_text="Job Description"
    )
    
    c1 = Candidate(
        id="c1", name="Alice", current_role="ML Engineer",
        experience_years=3.0, skills=["Python"], summary="Uses tensorflow", raw_text=""
    )
    c2 = Candidate(
        id="c2", name="Bob", current_role="ML Engineer",
        experience_years=3.0, skills=["Python", "PyTorch"], summary="pytorch expert", raw_text=""
    )
    
    passed, rejected = apply_hard_filters([c1, c2], jd)
    
    assert len(passed) == 1
    assert passed[0].name == "Bob"
    assert len(rejected) == 1
    assert rejected[0].candidate_name == "Alice"
    assert rejected[0].filter_type == "skills"
    assert "pytorch" in rejected[0].reason.lower()
