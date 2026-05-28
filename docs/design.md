# design.md
# AI Candidate Ranking System

## Overview

This system ranks candidates for a job description using a five-layer pipeline:
1. Dynamic rubric generation
2. Behavioral signal extraction
3. Semantic shortlist filtering
4. Pairwise LLM reranking
5. Recruiter-ready output generation

The design goal is to build a system that behaves more like a thoughtful recruiter than a keyword search engine.

---

## Design Principles

- Semantic understanding before scoring
- Cheap filters before expensive reasoning
- Relative comparison over noisy absolute scoring
- Explainability at every major step
- Free-tier friendly implementation
- Modular services with typed schemas

---

## End-to-End Flow

```text
Job Description
  -> JD parser
  -> rubric generator

Candidate CSV / resumes
  -> candidate parser
  -> normalization
  -> hard filter
  -> embeddings + FAISS shortlist
  -> behavioral scoring
  -> Top-20 selection
  -> pairwise LLM ranking + Elo
  -> confidence engine
  -> brief generator
  -> ranked CSV + Streamlit UI
```

---

## Major Components

### 1. JD Parser
Responsibility:
- parse raw JD text
- extract core constraints and signals
- produce structured `JobDescription`

Why it exists:
- downstream modules should consume normalized fields, not raw text blobs

### 2. Rubric Generator
Responsibility:
- generate role-specific evaluation dimensions from the JD
- assign normalized weights

Why it exists:
- different jobs require different evaluation lenses
- this is one of the main differentiators of the system

### 3. Candidate Parser
Responsibility:
- load structured CSV data and optional PDF resumes
- normalize text and fields into `Candidate` schema

Why it exists:
- candidate data is often noisy and needs standardization before scoring

### 4. Hard Filter Engine
Responsibility:
- eliminate clearly unqualified candidates before LLM-heavy stages

Why it exists:
- reduces cost and improves final shortlist quality

### 5. Embedding Retrieval Service
Responsibility:
- generate embeddings for JD and candidate profiles
- use FAISS to retrieve top semantic matches

Why it exists:
- semantic retrieval is the efficient narrowing stage before deep reasoning

### 6. Behavioral Scorer
Responsibility:
- score quantified impact, ownership, trajectory, and language strength

Why it exists:
- keyword matching misses quality of evidence in candidate descriptions

### 7. Pairwise Ranker
Responsibility:
- compare shortlisted candidates head-to-head
- convert comparison outcomes into Elo ratings

Why it exists:
- comparative judgment is more stable than raw absolute scores

### 8. Confidence Engine
Responsibility:
- estimate how trustworthy each rank is

Why it exists:
- honest uncertainty is more useful than fake precision

### 9. Hiring Brief Generator
Responsibility:
- create recruiter-friendly summaries and interview prompts

Why it exists:
- final outputs should be directly usable by humans, not just technically correct

### 10. UI Layer
Responsibility:
- expose upload, scoring, review, and export workflows through Streamlit

Why it exists:
- demo usability matters as much as model quality in a hackathon setting

---

## Suggested Folder Structure

```text
app/
  main.py
  config.py
  schemas/
    jd.py
    candidate.py
    rubric.py
    ranking.py
  services/
    jd_parser.py
    rubric_generator.py
    resume_parser.py
    hard_filter.py
    embedding_service.py
    behavioral_scorer.py
    pairwise_ranker.py
    confidence_engine.py
    brief_generator.py
  utils/
    prompts.py
    elo.py
    text_cleaning.py
    io.py
  ui/
    streamlit_app.py
```

---

## Data Contracts

### JobDescription
```python
class JobDescription(BaseModel):
    title: str
    required_skills: list[str]
    preferred_skills: list[str]
    min_experience_years: int
    responsibilities: list[str]
    raw_text: str
```

### Candidate
```python
class Candidate(BaseModel):
    id: str
    name: str
    current_role: str
    experience_years: float
    skills: list[str]
    summary: str
    achievements: list[str]
    raw_text: str
```

### Ranked Output
```python
class RankedCandidate(BaseModel):
    rank: int
    candidate_id: str
    semantic_score: float
    behavioral_score: float
    elo_score: float
    confidence: str
    gap_summary: str
    hiring_brief: str
    interview_question: str
```

---

## Scoring Strategy

### Stage 1: Hard Filter
Reject candidates who clearly violate must-have requirements.

Examples:
- below minimum experience
- missing mandatory skill
- missing required certification

### Stage 2: Semantic Score
Use embeddings to estimate conceptual similarity between the JD and candidate profile.

### Stage 3: Behavioral Score
Use LLM analysis to score evidence quality, including:
- quantified achievements
- ownership language
- career progression
- rubric alignment

### Stage 4: Pairwise Elo Score
For Top-20 candidates, compare A vs B repeatedly and update ratings.

### Stage 5: Confidence Label
Blend:
- profile completeness
- evidence richness
- ranking separation
- comparison confidence

---

## Why Pairwise Ranking

Absolute scoring is often unstable because one candidate may get 83 in one prompt and 77 in another with only small prompt variation. Pairwise ranking is more robust because the model only has to answer a narrower question: who is better for this role, and why?

This also produces more explainable rationale artifacts for the final deck.

---

## Why Dynamic Rubrics

Most hackathon systems hardcode one scoring framework for all roles. This system generates a rubric per job description, making it better suited for different hiring contexts.

Examples:
- backend engineer -> system design, performance, reliability
- growth manager -> experimentation, funnel optimization, channel ownership
- data scientist -> modeling depth, experimentation rigor, communication

---

## Prompting Design

Prompt design should be centralized in `utils/prompts.py` and separated by purpose:
- JD extraction prompt
- rubric prompt
- behavioral scoring prompt
- pairwise comparison prompt
- hiring brief prompt

Each prompt should request structured JSON output so parsing is reliable.

---

## Failure Handling Design

Key failure points:
- malformed CSV rows
- empty achievements field
- PDF extraction noise
- LLM malformed JSON
- rate limits

Mitigation pattern:
- validate every stage with Pydantic
- retry failed LLM calls
- save intermediate artifacts
- continue processing remaining candidates

---

## Output Design

Primary outputs:
- ranked CSV for submission
- candidate-level hiring briefs
- explainability notes for deck/demo

Recommended columns:
- rank
- name
- semantic_score
- behavioral_score
- elo_score
- confidence
- fit_summary
- gap_summary
- interview_question

---

## UI Design Notes

### Main Screen
- upload JD
- upload candidate file
- click rank

### Rubric Panel
- show generated dimensions and weights

### Ranking Table
- sortable scores
- confidence badges
- final rank ordering

### Candidate Detail Drawer
- evidence snippets
- fit rationale
- gaps
- interview question

### Export Area
- download CSV
- copy brief text

---

## Deployment Design

Primary mode:
- local Streamlit app

Optional mode:
- Streamlit Community Cloud or HF Spaces

The design assumes local embeddings and FAISS so the app remains low-cost and portable.

---

## Engineering Priorities

Build order should be:
1. Schemas
2. Candidate/JD ingestion
3. Hard filters
4. Embedding shortlist
5. Rubric generation
6. Behavioral scoring
7. Pairwise ranking
8. Confidence engine
9. Hiring briefs
10. UI polish

This keeps deterministic foundations stable before LLM-heavy layers are added.

---

## Design Outcome

A successful implementation should let a user paste a JD, upload candidate data, and receive a shortlist that is not only ranked, but explained, confidence-tagged, and immediately useful in a recruiter workflow.
