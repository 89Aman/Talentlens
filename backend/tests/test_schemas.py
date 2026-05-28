import pytest
from pydantic import ValidationError
from app.schemas.jd import JobDescription
from app.schemas.candidate import Candidate
from app.schemas.rubric import RubricDimension, Rubric
from app.schemas.ranking import BehavioralScore, PairwiseResult

def test_job_description_validation():
    # Valid model
    jd = JobDescription(
        title="ML Engineer",
        required_skills=["Python", "PyTorch"],
        min_experience_years=3,
        responsibilities=["Train models"],
        raw_text="Job Description raw text"
    )
    assert jd.title == "ML Engineer"
    assert jd.min_experience_years == 3

def test_candidate_validation():
    candidate = Candidate(
        id="c_01",
        name="John Doe",
        current_role="Data Scientist",
        experience_years=4.5,
        skills=["Python", "R"],
        summary="A professional summary",
        achievements=["Built some model"],
        raw_text="Raw resume profile text"
    )
    assert candidate.name == "John Doe"

def test_rubric_weights_validation():
    # Sum is 1.0 (valid)
    dims = [
        RubricDimension(name="A", weight=0.6, description="Desc A", scoring_guide="Guide A"),
        RubricDimension(name="B", weight=0.4, description="Desc B", scoring_guide="Guide B")
    ]
    rubric = Rubric(dimensions=dims, generated_for="ML Engineer")
    assert rubric.generated_for == "ML Engineer"

    # Sum is not 1.0 (invalid)
    invalid_dims = [
        RubricDimension(name="A", weight=0.6, description="Desc A", scoring_guide="Guide A"),
        RubricDimension(name="B", weight=0.5, description="Desc B", scoring_guide="Guide B")
    ]
    with pytest.raises(ValidationError):
        Rubric(dimensions=invalid_dims, generated_for="ML Engineer")
