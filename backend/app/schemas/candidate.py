from pydantic import BaseModel, Field

class Candidate(BaseModel):
    id: str = Field(..., description="Candidate unique identifier (e.g. index or UUID)")
    name: str = Field(..., description="Full name of candidate")
    current_role: str = Field(..., description="Current job title")
    experience_years: float = Field(..., description="Years of total professional experience")
    skills: list[str] = Field(default_factory=list, description="Extracted skills")
    summary: str = Field(..., description="Professional resume summary")
    achievements: list[str] = Field(default_factory=list, description="Key professional achievements")
    raw_text: str = Field(..., description="Full concatenated resume or profile text")
