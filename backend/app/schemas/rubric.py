from pydantic import BaseModel, Field, field_validator

class RubricDimension(BaseModel):
    name: str = Field(..., description="Name of the rubric dimension")
    weight: float = Field(..., description="Weight of the dimension, between 0.0 and 1.0")
    description: str = Field(..., description="Brief description of what this measures")
    scoring_guide: str = Field(..., description="Guide defining strong vs weak evidence")

class Rubric(BaseModel):
    dimensions: list[RubricDimension] = Field(..., description="List of 4-6 rubric dimensions")
    generated_for: str = Field(..., description="Job Description title rubric was generated for")

    @field_validator("dimensions")
    @classmethod
    def weights_must_sum_to_one(cls, v):
        if not v:
            raise ValueError("Rubric must contain at least one dimension")
        total = sum(d.weight for d in v)
        if abs(total - 1.0) >= 0.01:
            raise ValueError(f"Weights sum to {total}, expected 1.0")
        return v
