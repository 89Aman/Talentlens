# Technical Requirements Specification (TRS)
# AI Candidate Ranking System
**Version:** 1.0.0  
**Date:** May 28, 2026  
**Author:** Aman Sharma

---

## 1. Purpose

This document defines the technical requirements, implementation constraints, system interfaces, runtime behavior, validation rules, and operational expectations for the AI Candidate Ranking System. The system is designed to read a job description, analyze candidate profiles, generate a ranked shortlist, and produce recruiter-ready explanations using a hybrid pipeline of rule-based filtering, semantic retrieval, behavioral scoring, pairwise LLM ranking, and confidence estimation.

---

## 2. System Scope

The system must support:
- JD ingestion from text or file
- Candidate ingestion from CSV and optionally PDF resumes
- Dynamic rubric generation per job description
- Rule-based filtering for must-have constraints
- Semantic shortlist generation using embeddings + FAISS
- Behavioral signal extraction from candidate language
- Pairwise LLM comparison for final reranking
- Confidence scoring and uncertainty flagging
- Hiring brief and interview question generation
- Ranked CSV export and a Streamlit UI

The system is intended for a hackathon-grade V1, but should be structured so it can evolve into a production-style architecture.

---

## 3. Architecture Requirements

### 3.1 Processing Stages
The system shall process data in the following order:
1. Ingest and parse JD
2. Generate dynamic rubric from JD
3. Ingest and normalize candidate data
4. Apply hard filters
5. Generate embeddings and semantic shortlist
6. Score behavioral signals
7. Select top candidates for pairwise ranking
8. Run pairwise LLM comparisons and Elo updates
9. Compute confidence labels
10. Generate hiring briefs and export outputs

### 3.2 Pipeline Constraints
- Hard filtering must run before expensive LLM ranking
- Semantic retrieval must reduce candidate pool before pairwise comparisons
- Pairwise comparisons must only run on a bounded shortlist (default Top-20)
- Hiring brief generation must only run for final shortlisted candidates (default Top-10)
- Every candidate removed by hard filters must be logged with a reason

---

## 4. Functional Technical Requirements

### TR-01 JD Input
The system shall accept:
- plain text JD input
- `.txt` file input
- `.pdf` file input (optional in V1)

The system shall extract or derive:
- role title
- required skills
- preferred skills
- minimum years of experience
- responsibilities
- optional culture/team signals

### TR-02 Candidate Input
The system shall support candidate ingestion from:
- CSV file with structured columns
- optional PDF resumes directory

Minimum supported CSV columns:
- `name`
- `current_role`
- `experience_years`
- `skills`
- `summary`
- `achievements`

The system shall normalize candidate records into a common schema before downstream scoring.

### TR-03 Dynamic Rubric Generation
The system shall send the parsed JD to an LLM and require a structured rubric output containing:
- 4 to 6 dimensions
- numeric weights
- short descriptions
- optional scoring notes

Rubric validation rules:
- weights must sum to 1.0 (or 100 after normalization)
- dimension names must be unique
- no empty descriptions allowed

### TR-04 Hard Filter Engine
The system shall apply deterministic rule-based filtering before embedding and LLM stages.

Supported filters:
- minimum experience years
- required skills presence
- degree/certification if explicitly required
- location if available and requested

The engine shall produce:
- filtered candidate list
- rejected candidate list with reason codes

### TR-05 Semantic Retrieval
The system shall:
- generate an embedding for the JD
- generate embeddings for each candidate profile
- index candidate vectors using FAISS
- compute semantic similarity and return Top-K matches

Default configuration:
- embedding model: local sentence-transformer
- shortlist size: 30 or 50 configurable

### TR-06 Behavioral Signal Scoring
The system shall evaluate each shortlisted candidate for evidence of:
- quantified impact
- ownership scope
- trajectory velocity
- language specificity
- rubric relevance

The output shall include:
- sub-scores
- extracted evidence snippets
- final behavioral score

### TR-07 Pairwise Reranking
The system shall compare shortlisted candidates in pairs using an LLM.

For each pair, the system shall return:
- winner candidate ID
- concise rationale
- deciding rubric dimension
- comparison confidence

The pairwise module shall:
- generate all candidate pairs or a bounded tournament schedule
- update ratings using Elo
- output final sorted ranking scores

### TR-08 Confidence Engine
The system shall assign each finalist a confidence label.

Confidence computation should consider:
- completeness of candidate profile
- strength of semantic similarity
- density of behavioral evidence
- pairwise decisiveness / Elo margin

Supported labels:
- High
- Medium
- Low

### TR-09 Hiring Brief Generation
The system shall generate for each final candidate:
- fit summary
- gap summary
- one interview question

Output constraints:
- concise recruiter-friendly style
- evidence-based language
- no unsupported claims

### TR-10 Output Export
The system shall export:
- ranked CSV file
- optional JSON results
- UI table in Streamlit

Minimum CSV fields:
- rank
- candidate_name
- semantic_score
- behavioral_score
- elo_score
- confidence
- gap_summary
- hiring_brief
- interview_question

---

## 5. Non-Functional Technical Requirements

### 5.1 Performance
Target performance on a laptop-grade local demo setup:
- parse JD: under 5 seconds
- embed 500 candidate records: under 20 seconds
- semantic shortlist retrieval: under 2 seconds after indexing
- full pipeline for 100 candidates: under 3 minutes
- pairwise ranking on Top-20: ideally under 60 seconds with batching

### 5.2 Cost
- The default build must run using free or free-tier components
- Embeddings and vector search must work fully locally
- LLM usage should be minimized by staged filtering

### 5.3 Reliability
- The system must fail gracefully if one candidate record is malformed
- Partial pipeline outputs should still be saved when possible
- LLM JSON parsing errors must trigger retries or fallback parsing

### 5.4 Explainability
- Every finalist must have a visible rationale path
- Every rejected candidate from hard filtering must have a stored reason
- Pairwise comparison outputs must store rationale text for auditability

### 5.5 Maintainability
- Core logic must be modularized into service files
- Prompt templates must be centrally stored
- Pydantic models must define all major interfaces

---

## 6. Technology Requirements

### 6.1 Required Stack
- Python 3.11+
- Pandas
- Pydantic v2
- sentence-transformers
- FAISS (`faiss-cpu`)
- pdfplumber or PyMuPDF
- Streamlit

### 6.2 LLM Providers
Preferred free-tier routing:
- Gemini 1.5 Flash for rubric and brief generation
- Groq-hosted open model for pairwise ranking

The implementation should abstract provider usage through a shared client layer so models can be swapped.

### 6.3 Storage
V1 storage requirements:
- local filesystem for inputs and outputs
- CSV / JSON output artifacts
- no mandatory database required

Optional future storage:
- SQLite / PostgreSQL
- pgvector
- object storage for resumes

---

## 7. Data Model Requirements

### 7.1 JobDescription
Required fields:
- `title: str`
- `required_skills: list[str]`
- `preferred_skills: list[str]`
- `min_experience_years: int`
- `responsibilities: list[str]`
- `raw_text: str`

### 7.2 Candidate
Required fields:
- `id: str`
- `name: str`
- `current_role: str`
- `experience_years: float`
- `skills: list[str]`
- `summary: str`
- `achievements: list[str]`
- `raw_text: str`

### 7.3 Rubric
Required fields:
- `dimensions: list[RubricDimension]`
- `generated_for: str`

Each rubric dimension must contain:
- `name`
- `weight`
- `description`
- `scoring_guide`

### 7.4 RankedCandidate
Required fields:
- `rank`
- `candidate_id`
- `semantic_score`
- `behavioral_score`
- `elo_score`
- `confidence`
- `gap_summary`
- `hiring_brief`
- `interview_question`

---

## 8. Interface Requirements

### 8.1 CLI / Script Interface
The system should support direct local execution via Python entrypoint.

Example flow:
```bash
python app/main.py --jd data/sample_jd.txt --candidates data/candidates.csv
```

### 8.2 Streamlit UI
The UI should support:
- JD upload / text paste
- candidate CSV upload
- trigger ranking button
- rubric display
- ranking table
- candidate detail panel
- CSV export

### 8.3 Internal Service Contracts
Each service should expose a clear function or class interface.

Examples:
- `parse_jd(text) -> JobDescription`
- `generate_rubric(jd) -> Rubric`
- `load_candidates(path) -> list[Candidate]`
- `semantic_shortlist(jd, candidates, top_k) -> list[CandidateScore]`
- `pairwise_rank(candidates, rubric, jd) -> list[RankedCandidate]`

---

## 9. Logging and Observability Requirements

The system shall log:
- file ingestion success/failure
- number of candidates loaded
- number rejected by hard filters
- embedding stage start/end
- LLM call success/failure
- pairwise comparison progress
- export status

Recommended logging levels:
- INFO for stage progress
- WARNING for recoverable issues
- ERROR for stage failure

Optional V1 extras:
- save pairwise rationales to JSON
- save timing metrics per stage

---

## 10. Security and Privacy Requirements

For V1:
- no external resume storage required
- no user authentication required
- API keys must be loaded from environment variables
- no hardcoded secrets in repo

Minimum expectations:
- `.env` usage
- `.gitignore` for secrets and outputs
- no raw personal candidate data committed to public repo unless synthetic/sample

---

## 11. Error Handling Requirements

The system must handle:
- missing required CSV columns
- invalid candidate rows
- PDF parsing failure
- LLM timeout or malformed JSON
- empty shortlist after hard filters
- API quota/rate limit errors

Expected behavior:
- return actionable error message
- preserve partial outputs if possible
- avoid total crash from single record failure

---

## 12. Testing Requirements

Minimum required tests:
- schema validation tests
- JD parsing tests
- candidate CSV ingestion tests
- hard filter logic tests
- FAISS shortlist sanity test
- Elo update logic tests
- output export tests

Recommended extras:
- prompt snapshot tests
- mock LLM response parsing tests
- regression test using small sample dataset

---

## 13. Deployment Requirements

Default deployment target:
- local laptop demo via Streamlit

Optional free-tier deployment:
- Streamlit Community Cloud
- Hugging Face Spaces
- Render / Railway / Cloud Run for API

The deployed app must be able to run without paid infrastructure.

---

## 14. Acceptance Criteria

The V1 system is acceptable when all of the following are true:
- A JD can be uploaded and parsed successfully
- A candidate CSV can be uploaded and normalized
- A dynamic rubric is generated for the JD
- Hard filters remove clearly unqualified candidates with logged reasons
- Embedding retrieval returns a semantic Top-K shortlist
- Behavioral scoring runs on the shortlist
- Pairwise reranking produces a stable final ranking
- Final candidates receive confidence labels
- Hiring briefs and interview questions are generated
- Ranked CSV export is downloadable
- The full demo runs using free or free-tier tools

---

## 15. Future Extensions

Post-hackathon extensions may include:
- ATS integrations
- recruiter feedback loop for ranking correction
- bias and fairness auditing
- multilingual resume support
- persistent database and analytics layer
- team collaboration features
- interactive pairwise review by human recruiter

---

## 16. Summary of Technical Intent

The technical design must favor practicality over overengineering. The goal is not to build a giant enterprise ATS, but a precise, explainable, recruiter-usable ranking engine that demonstrates strong system design, effective LLM usage, good cost control, and credible end-to-end execution.
