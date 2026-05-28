# data_schema.md
# AI Candidate Ranking System — Data Schema Reference
**Version:** 1.0.0
**Date:** May 28, 2026

This document defines all Pydantic data models used across the system.
These are the single source of truth for all data contracts.

---

## JobDescription
**File:** `schemas/jd.py`

```python
class JobDescription(BaseModel):
    title: str
    required_skills: list[str]
    preferred_skills: list[str] = []
    min_experience_years: int = 0
    responsibilities: list[str]
    culture_signals: list[str] = []
    raw_text: str
```

**Notes:**
- `raw_text` stores original JD for reference during prompting
- `preferred_skills` and `culture_signals` are optional

---

## Candidate
**File:** `schemas/candidate.py`

```python
class Candidate(BaseModel):
    id: str
    name: str
    current_role: str
    experience_years: float
    skills: list[str]
    summary: str
    achievements: list[str] = []
    raw_text: str
```

**Notes:**
- `id` should be auto-generated as UUID or row index string
- `raw_text` is the concatenated profile text used for embedding
- `achievements` defaults to empty list if column is missing from CSV

---

## RubricDimension
**File:** `schemas/rubric.py`

```python
class RubricDimension(BaseModel):
    name: str
    weight: float
    description: str
    scoring_guide: str
```

## Rubric
**File:** `schemas/rubric.py`

```python
class Rubric(BaseModel):
    dimensions: list[RubricDimension]
    generated_for: str

    @validator("dimensions")
    def weights_must_sum_to_one(cls, dims):
        total = sum(d.weight for d in dims)
        assert abs(total - 1.0) < 0.01, f"Weights sum to {total}, expected 1.0"
        return dims
```

---

## BehavioralScore
**File:** `schemas/ranking.py`

```python
class BehavioralScore(BaseModel):
    candidate_id: str
    quantified_impact_score: int
    quantified_impact_evidence: str
    ownership_scope_score: int
    ownership_scope_evidence: str
    trajectory_velocity_score: int
    trajectory_velocity_evidence: str
    rubric_alignment_score: int
    rubric_alignment_evidence: str
    final_behavioral_score: int
    summary: str
```

---

## PairwiseResult
**File:** `schemas/ranking.py`

```python
class PairwiseResult(BaseModel):
    candidate_a_id: str
    candidate_b_id: str
    winner_id: str
    rationale: str
    deciding_dimension: str
    confidence: Literal["High", "Medium", "Low"]
```

---

## RankedCandidate
**File:** `schemas/ranking.py`

```python
class RankedCandidate(BaseModel):
    rank: int
    candidate: Candidate
    semantic_score: float
    behavioral_score: int
    elo_score: float
    confidence: Literal["High", "Medium", "Low"]
    fit_summary: str
    gap_summary: str
    interview_question: str
```

---

## FilteredOut
**File:** `schemas/ranking.py`

```python
class FilteredOut(BaseModel):
    candidate_id: str
    candidate_name: str
    reason: str
    filter_type: Literal["experience", "skills", "degree", "location"]
```

---

## CandidateScore (Semantic Retrieval)
**File:** `schemas/ranking.py`

```python
class CandidateScore(BaseModel):
    candidate: Candidate
    semantic_score: float
```

---

## CSV Input Schema

Minimum required columns in `candidates.csv`:

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| name | str | Yes | Full name |
| current_role | str | Yes | Current job title |
| experience_years | float | Yes | Total years of experience |
| skills | str | Yes | Comma-separated skills list |
| summary | str | Yes | Career summary paragraph |
| achievements | str | No | Pipe-separated achievements |

### Example Row
```
name,current_role,experience_years,skills,summary,achievements
Jane Doe,ML Engineer,4.5,"Python,PyTorch,Kubernetes","Built ML pipelines at scale...","Reduced latency by 40%|Led team of 5"
```

---

## Output CSV Schema

Columns in `outputs/ranked_results.csv`:

| Column | Type | Notes |
|--------|------|-------|
| rank | int | Final position |
| name | str | Candidate name |
| current_role | str | Current title |
| experience_years | float | Total years |
| semantic_score | float | 0.0 to 1.0 |
| behavioral_score | int | 0 to 100 |
| elo_score | float | Starting at 1500 |
| confidence | str | High / Medium / Low |
| fit_summary | str | 1-2 sentence fit rationale |
| gap_summary | str | Key gap |
| interview_question | str | Tailored question |
