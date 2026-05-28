# tasks.md
# AI Candidate Ranking System — Build Task List
**Version:** 1.0.0
**Date:** May 28, 2026

---

## How to Use This File
Work through tasks in order. Each task has a clear input, output, and done condition.
Do not skip phases. Every phase depends on the previous one being stable.

---

## Phase 0: Project Setup

- [ ] Create project folder `ai-candidate-ranking/`
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate venv and install dependencies from `requirements.txt`
- [ ] Create `.env` file with API keys from `.env.example`
- [ ] Verify Gemini API key works via a hello-world call
- [ ] Verify Groq API key works via a hello-world call
- [ ] Create all empty `__init__.py` files for each package
- [ ] Create `outputs/` and `data/` directories

**Done when:** `python app/main.py` runs without import errors

---

## Phase 1: Schemas

- [ ] Write `schemas/jd.py` — `JobDescription` Pydantic model
- [ ] Write `schemas/candidate.py` — `Candidate` Pydantic model
- [ ] Write `schemas/rubric.py` — `Rubric` and `RubricDimension` models
- [ ] Write `schemas/ranking.py` — `RankedCandidate`, `PairwiseResult`, `BehavioralScore`
- [ ] Write `tests/test_schemas.py` — validate all models with mock data
- [ ] Run tests: all pass

**Done when:** All schemas import cleanly and test_schemas.py passes

---

## Phase 2: Utilities

- [ ] Write `utils/logger.py` — configure structured logging with timestamps
- [ ] Write `utils/text_cleaner.py` — normalize whitespace, strip bullets, clean unicode
- [ ] Write `utils/llm_client.py` — unified client for Gemini and Groq
  - [ ] `call_gemini(prompt, system_prompt) -> str`
  - [ ] `call_groq(prompt, system_prompt) -> str`
  - [ ] `parse_json_response(text) -> dict` with retry logic
- [ ] Write `utils/prompts.py` — all prompt templates as constants
- [ ] Write `app/config.py` — load `.env`, expose settings as typed config object

**Done when:** `llm_client.py` can call both providers and parse a JSON response

---

## Phase 3: Input Layer

- [ ] Write `services/jd_parser.py`
  - [ ] `parse_jd_text(text: str) -> JobDescription`
  - [ ] `parse_jd_file(path: str) -> JobDescription`
- [ ] Write `services/candidate_parser.py`
  - [ ] `load_candidates_csv(path: str) -> list[Candidate]`
  - [ ] `load_candidates_pdf(folder: str) -> list[Candidate]` (optional)
  - [ ] `normalize_candidate(row: dict) -> Candidate`
- [ ] Add `data/sample_jd.txt` — a realistic ML Engineer JD
- [ ] Add `data/candidates.csv` — 20+ sample candidates
- [ ] Test parsing: confirm all candidates load with correct types

**Done when:** 20 candidates load from CSV without validation errors

---

## Phase 4: Hard Filter

- [ ] Write `services/hard_filter.py`
  - [ ] `apply_hard_filters(candidates, jd) -> tuple[list[Candidate], list[FilteredOut]]`
  - [ ] Filter: minimum experience years
  - [ ] Filter: required skills presence
  - [ ] Log all rejected candidates with reason
- [ ] Write `tests/test_hard_filter.py`
  - [ ] Test case: candidate below min experience is rejected
  - [ ] Test case: candidate missing required skill is rejected
  - [ ] Test case: valid candidate passes

**Done when:** Hard filter correctly removes 3+ candidates from sample dataset

---

## Phase 5: Semantic Retrieval

- [ ] Write `services/embedding_service.py`
  - [ ] `build_index(candidates: list[Candidate]) -> FAISSIndex`
  - [ ] `embed_text(text: str) -> np.ndarray`
  - [ ] `semantic_shortlist(jd, candidates, top_k=50) -> list[CandidateScore]`
- [ ] Test: embedding a JD + 20 candidates returns sorted similarity scores
- [ ] Write `tests/test_embedding.py`

**Done when:** Top-K retrieval returns a plausible shortlist for the sample JD

---

## Phase 6: Rubric Generation

- [ ] Write `services/rubric_generator.py`
  - [ ] `generate_rubric(jd: JobDescription) -> Rubric`
  - [ ] Validate weights sum to 1.0
  - [ ] Retry on malformed LLM response
- [ ] Test: rubric has 4-6 dimensions, all weights valid
- [ ] Log rubric to console for visibility

**Done when:** Rubric generates correctly for the sample JD in under 5 seconds

---

## Phase 7: Behavioral Scoring

- [ ] Write `services/behavioral_scorer.py`
  - [ ] `score_candidate(candidate, jd, rubric) -> BehavioralScore`
  - [ ] Sub-scores: quantified_impact, ownership_scope, trajectory_velocity
  - [ ] Extract evidence snippets per sub-score
- [ ] Run on full shortlist
- [ ] Test: behavioral scores differ meaningfully across candidates

**Done when:** All Top-50 candidates have behavioral scores with evidence

---

## Phase 8: Pairwise Ranking

- [ ] Write `services/elo.py`
  - [ ] `expected_score(rating_a, rating_b) -> float`
  - [ ] `update_elo(rating_a, rating_b, winner, k=24) -> tuple[float, float]`
- [ ] Write `services/pairwise_ranker.py`
  - [ ] `generate_pairs(candidates) -> list[tuple]`
  - [ ] `run_comparison(a, b, jd, rubric) -> PairwiseResult`
  - [ ] `run_tournament(candidates, jd, rubric) -> list[RankedCandidate]`
- [ ] Write `tests/test_elo.py`
  - [ ] Test: winner gains rating, loser loses
  - [ ] Test: equal match produces equal expected score

**Done when:** Top-20 produces a stable sorted ranking after tournament

---

## Phase 9: Confidence Engine

- [ ] Write `services/confidence_engine.py`
  - [ ] `compute_confidence(candidate, behavioral_score, elo_score, semantic_score) -> str`
  - [ ] Return "High" / "Medium" / "Low"
  - [ ] Log sparse profile flags

**Done when:** Every finalist has a confidence label

---

## Phase 10: Hiring Brief Generation

- [ ] Write `services/brief_generator.py`
  - [ ] `generate_brief(candidate, jd, rubric) -> dict`
  - [ ] Returns: fit_summary, gap_summary, interview_question
- [ ] Run for Top-10 finalists only
- [ ] Validate all three fields are non-empty

**Done when:** All Top-10 have complete briefs with no empty fields

---

## Phase 11: Pipeline Wiring

- [ ] Write `app/main.py`
  - [ ] Wire all services in correct order
  - [ ] Accept CLI args: `--jd`, `--candidates`
  - [ ] Export ranked CSV to `outputs/ranked_results.csv`
  - [ ] Export hiring briefs to `outputs/hiring_briefs.json`
- [ ] Write `tests/test_pipeline.py` — end-to-end smoke test
- [ ] Run full pipeline on sample data

**Done when:** `python app/main.py --jd data/sample_jd.txt --candidates data/candidates.csv` completes without errors and produces output files

---

## Phase 12: Streamlit UI

- [ ] Write `ui/streamlit_app.py`
  - [ ] Page 1: Upload JD + candidates
  - [ ] Page 2: Show generated rubric
  - [ ] Page 3: Ranking table with scores and confidence badges
  - [ ] Page 4: Candidate detail panel
  - [ ] Page 5: CSV export button
- [ ] Run: `streamlit run ui/streamlit_app.py`
- [ ] Test on sample data end-to-end

**Done when:** Full demo runs in browser with no visible errors

---

## Phase 13: Polish and Demo Prep

- [ ] Add loading spinners to Streamlit UI
- [ ] Pre-cache rubric and shortlist results for live demo
- [ ] Test with at least 2 different JDs
- [ ] Prepare 3-slide explainer: problem → pipeline → demo
- [ ] Record backup demo video in case of live connection issues
