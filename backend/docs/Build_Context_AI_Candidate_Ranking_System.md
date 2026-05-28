# Build Context Document
# AI Candidate Ranking System — Detailed Build Context
**Version:** 1.0.0
**Date:** May 28, 2026
**Author:** Aman Sharma

---

## 1. Why This Project Exists

Most candidate ranking systems fail because they rely on keyword overlap. If a JD asks for "distributed systems" and a candidate writes "built event-driven microservices on Kafka," many ATS systems under-rank them even though the candidate may be excellent.

This project aims to mimic how a strong recruiter or hiring manager evaluates talent:
1. Understand what the role truly needs
2. Detect evidence of relevant experience, not just words
3. Compare candidates relative to each other
4. Explain the decision clearly

This is not just a resume matcher. It is a multi-stage reasoning pipeline.

---

## 2. Core Product Idea

The product takes two inputs:
- A Job Description
- A dataset of candidate profiles/resumes

It returns:
- A ranked shortlist
- Confidence scores
- Gap analysis
- A 3-sentence hiring brief per candidate
- One tailored interview question per shortlisted candidate

The system is differentiated because it combines symbolic filtering, semantic similarity, behavioral scoring, pairwise LLM comparison, and explainability in one pipeline.

---

## 3. How the 5 Layers Work Together

### Layer 1 — Dynamic Rubric Generation
Input: JD text
Output: role-specific scoring rubric

This layer exists because different roles should be judged differently. A backend engineer should not be scored on the same rubric as a product analyst. The LLM reads the JD and generates dimensions such as:
- System design depth
- Production ownership
- Team collaboration
- Domain relevance
- Leadership trajectory

This becomes the evaluation lens for all later stages.

### Layer 2 — Behavioral Signal Extraction
Input: candidate raw text
Output: behavioral score + evidence

This layer tries to answer: how strong is the signal in the way the candidate describes their work?

Signals to detect:
- Quantified impact: percentages, scale numbers, latency reductions, revenue increases
- Ownership scope: built, led, managed, architected, mentored, shipped
- Trajectory velocity: intern → engineer → senior engineer; promotions; scope growth
- Language depth: specific technical verbs vs generic filler

This gives the system nuance beyond static skill matching.

### Layer 3 — Semantic Pool Filter
Input: JD + candidate profiles
Output: Top-30 or Top-50 shortlist

This is the fast narrowing stage. The system embeds the JD and candidate profiles into vectors, then retrieves the nearest matches using FAISS. This avoids sending 500 candidates to expensive LLM reasoning.

Also apply hard filters here:
- Min experience
- Required skill presence
- Mandatory degree/cert/license (if role requires it)
- Optional location filter

### Layer 4 — Pairwise LLM Re-Ranking
Input: Top-20 shortlist
Output: final relative ranking

This is the most unique layer. Instead of asking "Rate Candidate A out of 100," the system asks:
- For this role, is Candidate A or Candidate B stronger?
- Which one better matches the rubric?
- What is the specific deciding factor?

Pairwise ranking is more stable because LLMs are often better at comparative judgments than absolute scoring.

Use Elo-style updates so repeated wins push strong candidates upward.

### Layer 5 — Recruiter-Ready Output
Input: final shortlist
Output: hiring artifacts

This converts the ranking into something a recruiter can actually use:
- Ranked CSV with scores
- Confidence label
- Gap analysis
- Short hiring brief
- Interview question
- Explainability notes for each ranking

This is important because recruiters do not want just "AI says rank #2." They want a usable reason.

---

## 4. Recommended Repository Structure

```bash
ai-candidate-ranking/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── schemas/
│   │   ├── jd.py
│   │   ├── candidate.py
│   │   ├── rubric.py
│   │   └── ranking.py
│   ├── services/
│   │   ├── jd_parser.py
│   │   ├── rubric_generator.py
│   │   ├── resume_parser.py
│   │   ├── hard_filter.py
│   │   ├── embedding_service.py
│   │   ├── behavioral_scorer.py
│   │   ├── pairwise_ranker.py
│   │   ├── confidence_engine.py
│   │   └── brief_generator.py
│   ├── utils/
│   │   ├── prompts.py
│   │   ├── elo.py
│   │   ├── text_cleaning.py
│   │   └── logging.py
│   └── ui/
│       └── streamlit_app.py
├── data/
│   ├── sample_jd.txt
│   ├── candidates.csv
│   └── resumes/
├── outputs/
├── notebooks/
├── tests/
├── requirements.txt
└── README.md
```

---

## 5. Module Responsibilities

### `jd_parser.py`
- Accept raw JD text or PDF
- Extract title, required skills, preferred skills, experience, role signals
- Return `JobDescription`

### `rubric_generator.py`
- Send parsed JD to Gemini
- Ask for 4-6 weighted evaluation dimensions
- Validate that weights sum to 1.0
- Return `Rubric`

### `resume_parser.py`
- Read CSV or PDF resumes
- Normalize text fields
- Build candidate objects

### `hard_filter.py`
- Check must-have conditions
- Maintain list of removed candidates + reasons
- Return filtered candidate list

### `embedding_service.py`
- Load sentence-transformers model
- Generate embeddings for JD and candidates
- Build FAISS index
- Return Top-K semantic matches

### `behavioral_scorer.py`
- Prompt LLM with candidate text + rubric
- Extract scored evidence for quantified impact, ownership, trajectory
- Return structured behavioral score object

### `pairwise_ranker.py`
- Generate candidate pairs from Top-20
- Ask LLM to choose winner for each pair
- Update Elo after each result
- Produce final ranking order

### `confidence_engine.py`
- Compute confidence score from data completeness + margin of victory + profile richness
- Label High / Medium / Low

### `brief_generator.py`
- Generate recruiter brief and interview question for each finalist
- Keep output concise and consistent

---

## 6. Suggested Prompting Strategy

### Prompt 1: Rubric Generation
Goal: Create evaluation dimensions from JD

The LLM should return JSON only with fields:
- dimension_name
- weight
- description
- scoring_guide

Important prompt rules:
- Weights must sum to 1.0
- Use 4-6 dimensions only
- Prefer measurable dimensions
- Avoid vague items like "overall fit"

### Prompt 2: Behavioral Signal Scoring
Goal: Score evidence strength in candidate language

Ask model to inspect:
- quantified achievements
- scope of ownership
- growth trajectory
- relevance to rubric

Return structured JSON with:
- quantified_impact_score
- ownership_score
- trajectory_score
- evidence_snippets
- final_behavioral_score

### Prompt 3: Pairwise Comparison
Goal: Decide whether Candidate A or B is better for this JD

Rules:
- Must choose one candidate
- Must cite evidence from both profiles
- Must mention which rubric dimension decided the result
- Keep rationale under 80 words

Return:
- winner_id
- rationale
- deciding_dimension
- confidence

### Prompt 4: Hiring Brief Generation
Goal: Generate recruiter-ready summary

Return:
- fit_summary
- gap_summary
- interview_question

Tone:
- concise
- evidence-based
- no generic fluff

---

## 7. Elo Ranking Logic

Why Elo?
Because pairwise decisions naturally map to a competitive rating system.

Implementation idea:
- Initialize all Top-20 candidates at 1500
- For each LLM comparison, winner gains rating, loser loses rating
- Use K=24 or K=32
- Final sorted ratings = final rank

Confidence can be derived from:
- Elo separation from surrounding candidates
- number of decisive wins
- LLM comparison confidence

---

## 8. Confidence Scoring Logic

A practical confidence formula can combine:
- Profile completeness score
- Behavioral evidence density
- Elo margin vs nearby candidates
- Semantic score strength

Example heuristic:
- High confidence: rich profile + strong semantic match + repeated pairwise wins
- Medium confidence: decent profile but some missing detail
- Low confidence: sparse profile, weak evidence, close comparisons

This helps the system avoid fake certainty.

---

## 9. Free-Tier Build Plan

### LLM Providers
- Gemini 1.5 Flash: rubric generation, hiring brief generation
- Groq LLaMA 3.1 70B or Mixtral: pairwise comparisons at scale

### Local Components
- sentence-transformers for embeddings
- FAISS for vector search
- pandas for CSV
- pdfplumber for resumes
- Streamlit for UI

This means the entire pipeline can run at near-zero cost for a hackathon demo.

---

## 10. Development Order

### Step 1: Build schemas first
Create all Pydantic models before touching LLM prompts. This forces consistent contracts.

### Step 2: Build deterministic layers next
Implement:
- JD parsing
- candidate ingestion
- hard filters
- embedding shortlist

Get this working with no LLM except maybe rubric generation.

### Step 3: Add behavioral scoring
Once Top-K retrieval works, layer in evidence scoring.

### Step 4: Add pairwise re-ranking
Limit to Top-10 or Top-20 to keep inference manageable.

### Step 5: Add hiring brief generation
Only for finalists.

### Step 6: Build Streamlit demo
Pages to include:
- Upload JD
- Upload candidate CSV/resumes
- View generated rubric
- View shortlist table
- Click candidate for explainability
- Export CSV

---

## 11. UI Plan

### Page 1: Inputs
- JD textarea / file upload
- candidate CSV upload
- optional resume PDF upload folder
- start ranking button

### Page 2: Rubric View
- show generated rubric dimensions + weights
- show parsed JD summary

### Page 3: Rankings
- table with rank, candidate, semantic score, behavioral score, Elo, confidence
- filters by confidence or experience

### Page 4: Candidate Detail
- profile summary
- evidence snippets
- why ranked here
- gap summary
- interview question

### Page 5: Export
- download CSV
- copy hiring briefs
- demo-ready explanation notes

---

## 12. Evaluation Strategy

You need to prove the system works better than keyword ranking.

Create a mini benchmark:
- 1 JD
- 15-20 candidate profiles
- manually define expected top 5
- compare results from:
  - keyword baseline
  - semantic only
  - full system

Judges love before/after comparisons.

Useful metrics:
- Top-5 precision
- human agreement score
- ranking consistency
- explanation quality

---

## 13. Demo Storyline

Best demo sequence:
1. Show a JD
2. Show a candidate who lacks exact keywords but clearly fits
3. Show keyword search missing them
4. Show your system generating rubric
5. Show shortlist + pairwise ranking
6. Show final hiring brief
7. Show confidence flag on a sparse profile

This creates a strong narrative: not just ranking, but trustworthy ranking.

---

## 14. Common Failure Cases

- Candidates with very short profiles → mark low confidence
- Very similar candidates → pairwise comparison confidence may be low
- LLM hallucinating evidence → always include evidence snippets from source text
- JDs with vague wording → rubric may become generic; prompt must force specificity
- Resume parsing inconsistencies → normalize whitespace, bullets, headings

---

## 15. What Makes This Hackathon-Worthy

This project is strong because it is not a simple chatbot or RAG wrapper. It has:
- a defined business use case
- multiple reasoning layers
- explainability
- recruiter-ready output
- measurable differentiation from basic ATS filters

It also gives judges something concrete to understand: "AI that ranks candidates like a thoughtful recruiter, not a keyword search engine."

---

## 16. Final Build Objective

At the end, you should have a system where someone can:
1. paste a JD
2. upload a CSV of candidates
3. click one button
4. receive a ranked shortlist with rationale, confidence, and interview prompts

That is the complete product experience for V1.
