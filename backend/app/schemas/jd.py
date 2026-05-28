from pydantic import BaseModel, Field

class JobDescription(BaseModel):
    title: str = Field(..., description="Job role title")
    required_skills: list[str] = Field(default_factory=list, description="Mandatory/Must-have skills")
    preferred_skills: list[str] = Field(default_factory=list, description="Nice-to-have/Optional skills")
    min_experience_years: int = Field(default=0, description="Minimum required experience in years")
    responsibilities: list[str] = Field(default_factory=list, description="Core responsibilities of the role")
    culture_signals: list[str] = Field(default_factory=list, description="Team/Company culture attributes")
    raw_text: str = Field(..., description="Unprocessed raw JD text")
