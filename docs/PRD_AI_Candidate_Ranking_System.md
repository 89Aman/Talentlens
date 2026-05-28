# Product Requirements Document (PRD)
# AI Candidate Ranking System
**Version:** 1.0.0
**Date:** May 28, 2026
**Author:** Aman Sharma
**Type:** Hackathon Project

---

## 1. Executive Summary

The AI Candidate Ranking System is an intelligent recruitment pipeline that replaces keyword-based filtering with genuine semantic understanding. It ingests a Job Description (JD) and a pool of candidate profiles (CSV/PDF), then produces a ranked shortlist with confidence scores, gap analysis, and a recruiter-ready hiring brief per candidate — all using free-tier AI tools.

---

## 2. Problem Statement

### Current Pain Points
- Traditional ATS systems use keyword matching — missing great candidates who describe skills differently
- Recruiters manually screen 100s of profiles, introducing bias and fatigue
- Scoring is subjective and non-reproducible
- No explainability: recruiters can't tell WHY a candidate was ranked #3 vs #7

### Target Users
- Hackathon judges evaluating the system
- Recruiters / HR teams at mid-to-large companies
- Startups with small HR teams doing high-volume hiring

---

## 3. Goals & Success Metrics

### Goals
1. Parse JD and generate a role-specific scoring rubric (not hardcoded)
2. Extract behavioral signals from candidate profiles
3. Shortlist Top-30 using semantic similarity
4. Re-rank Top-20 using pairwise LLM comparisons (Elo)
5. Output ranked CSV + confidence scores + hiring brief per candidate

### Success Metrics
- Rubric generation: <5s per JD
- Embedding + shortlist: <10s for 500 candidates
- Pairwise ranking: <60s for Top-20 (190 comparisons)
- Output quality: hiring brief must be 3 sentences, include gap + interview question
- Cost: $0 (all free tiers)

---

## 4. System Architecture

### High-Level Flow
```
JD Input ──► JD Understanding ──► Dynamic Rubric Generation ──┐
                                                               ▼
Candidate CSV/PDF ──► Structured Extraction ──► Hard Filter ──► Semantic Embedding (FAISS)
                                                               │
                                                               ▼ Top-50
                                                    Behavioral Signal Scoring
                                                               │
                                                               ▼ Top-20
                                                    Pairwise LLM Re-Ranking (Elo)
                                                               │
                                                               ▼
                                                    Uncertainty Flagging
                                                               │
                                                               ▼
                                                    Candidate Hiring Brief Generation
                                                               │
                                                               ▼
                                                    Final Ranked Output (Top-10)
```

### The 5 Layers
| Layer | Name | Purpose |
|-------|------|---------|
| 1 | Dynamic Rubric Generation | LLM reads JD → generates role-specific scoring dimensions + weights |
| 2 | Behavioral Signal Extraction | Detect quantified impact, ownership scope, trajectory velocity |
| 3 | Semantic Pool Filter | Embeddings + FAISS + hard rules → Top-30 shortlist |
| 4 | Pairwise LLM Re-Ranking | Head-to-head Elo tournament on Top-20 |
| 5 | Recruiter-Ready Output | Ranked CSV + confidence + hiring brief + interview question |

---

## 5. Functional Requirements

### FR-01: JD Ingestion
- Accept JD as plain text or .txt/.pdf file
- Extract: role title, required skills, experience level, responsibilities, culture signals
- Output: structured JD object (Pydantic model)

### FR-02: Dynamic Rubric Generation
- Send structured JD to LLM
- LLM returns 4-6 scoring dimensions with weights summing to 100
- Example output for "ML Engineer":
  - Technical depth in ML/DL: 30%
  - Production experience: 25%
  - Problem-solving ownership: 20%
  - Communication/documentation: 15%
  - Domain relevance: 10%
- Rubric must be regenerated fresh per JD — no hardcoded weights

### FR-03: Candidate Profile Ingestion
- Accept CSV with columns: name, current_role, experience_years, skills, summary, achievements
- OR accept folder of PDF resumes (parsed via pdfplumber)
- Output: list of structured Candidate objects (Pydantic)

### FR-04: Hard Filter Layer
- Rule-based elimination before LLM calls (saves tokens)
- Filters: minimum years of experience, required degree/certification, location (if specified)
- Eliminated candidates logged with reason, not silently dropped

### FR-05: Semantic Embedding & Shortlist
- Embed JD and all candidate profiles using sentence-transformers
- Compute cosine similarity via FAISS
- Return Top-50 candidates by semantic score

### FR-06: Behavioral Signal Scoring
- For each of Top-50, LLM analyzes:
  - Quantified impact: detects numbers, %, revenue, scale mentions
  - Ownership scope: IC / lead / cross-functional / org-wide signals
  - Trajectory velocity: promotions, role expansion, tenure patterns
- Returns per-candidate behavioral score (0-100) with sub-scores

### FR-07: Pairwise Re-Ranking
- Take Top-20 from behavioral scoring
- Run LLM pairwise comparisons: "For [role], is Candidate A or B stronger? Why?"
- Apply Elo algorithm to derive final ranking
- Number of comparisons: 20*19/2 = 190 (batched, ~60s total on Groq)

### FR-08: Uncertainty Flagging
- Tag each candidate with confidence level: High / Medium / Low
- Low confidence triggers if: profile word count < 100, no quantified achievements, <2 roles listed
- Confidence shown in final output so recruiter knows when to investigate manually

### FR-09: Hiring Brief Generation
- For Top-10 finalists, generate:
  - Sentence 1: Why they fit this role (specific evidence)
  - Sentence 2: Key gap or area to probe
  - Sentence 3: One smart interview question tailored to their profile
- Brief stored in output CSV and shown in Streamlit UI

### FR-10: Output Generation
- Ranked CSV: rank, name, elo_score, confidence, behavioral_score, semantic_score, gap_summary, hiring_brief
- Streamlit dashboard: sortable table, candidate detail view, rubric display
- Explainability panel: show WHY each candidate ranked where they did

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Cost | $0 (all free tiers) |
| Latency (full pipeline, 100 candidates) | < 3 minutes |
| LLM Provider | Gemini 1.5 Flash + Groq (fallback) |
| Embeddings | Local (sentence-transformers) |
| Offline capability | Layers 3 partial (embeddings local) |
| Demo readiness | Streamlit UI, works on localhost |

---

## 7. Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Language | Python 3.11+ | Ecosystem, speed of dev |
| LLM - Quality tasks | Gemini 1.5 Flash (free) | 1M tokens/day, fast |
| LLM - Volume tasks | Groq + LLaMA 3.1 70B (free) | 14k req/day, ultra-fast |
| Embeddings | sentence-transformers (local) | Free, no API needed |
| Vector Search | FAISS (local) | Fast, no server needed |
| Data models | Pydantic v2 | Validation + serialization |
| Data processing | Pandas | CSV handling |
| PDF parsing | pdfplumber | Resume extraction |
| UI | Streamlit | Fastest hackathon UI |
| API (optional) | FastAPI | If backend needed |

---

## 8. Data Models

### JD Object
```python
class JobDescription(BaseModel):
    title: str
    company: str | None
    required_skills: list[str]
    preferred_skills: list[str]
    min_experience_years: int
    responsibilities: list[str]
    culture_signals: list[str]
    raw_text: str
```

### Candidate Object
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

### Rubric Object
```python
class RubricDimension(BaseModel):
    name: str
    weight: float  # 0-1, all weights sum to 1.0
    description: str
    scoring_guide: str

class Rubric(BaseModel):
    dimensions: list[RubricDimension]
    generated_for: str  # JD title
```

### Ranked Candidate Output
```python
class RankedCandidate(BaseModel):
    rank: int
    candidate: Candidate
    elo_score: float
    semantic_score: float
    behavioral_score: float
    confidence: Literal["High", "Medium", "Low"]
    gap_summary: str
    hiring_brief: str
    interview_question: str
```

---

## 9. Out of Scope (Hackathon V1)

- Real-time ATS integration
- Multi-language resume support
- Video/audio interview analysis
- Bias detection auditing
- User authentication
- Database persistence (use CSV/JSON for now)

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Gemini rate limits hit during demo | Pre-cache results; use Groq as fallback |
| LLM pairwise takes too long live | Pre-run on sample dataset before demo |
| PDF parsing fails on complex resumes | Fallback to raw text extraction |
| FAISS slow on large datasets | Cap at 500 candidates for hackathon |

---

## 11. Milestones

| Phase | Tasks | Time Estimate |
|-------|-------|--------------|
| Phase 1 | Data models + JD parser + rubric gen | 3-4 hours |
| Phase 2 | Candidate ingestion + hard filter + embeddings | 3-4 hours |
| Phase 3 | Behavioral scoring + pairwise ranking | 4-5 hours |
| Phase 4 | Hiring brief gen + output CSV | 2-3 hours |
| Phase 5 | Streamlit UI + polish | 3-4 hours |
| **Total** | | **~18-20 hours** |
