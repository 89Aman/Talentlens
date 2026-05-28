# README.md
# AI Candidate Ranking System

An intelligent candidate ranking pipeline that uses semantic embeddings,
behavioral signal extraction, and pairwise LLM comparison to rank candidates
for a job description — the way a great recruiter would, not a keyword filter.

---

## What It Does

1. Reads a Job Description
2. Generates a role-specific evaluation rubric
3. Loads candidate profiles (CSV or PDF resumes)
4. Removes clearly unqualified candidates via hard filters
5. Shortlists Top-50 using semantic similarity (FAISS)
6. Scores behavioral signals (quantified impact, ownership, trajectory)
7. Re-ranks Top-20 using pairwise LLM comparisons + Elo
8. Generates recruiter-ready hiring brief + interview question per finalist
9. Exports ranked CSV and Streamlit dashboard

---

## Tech Stack

- Python 3.11+
- Gemini 1.5 Flash (rubric + briefs)
- Groq LLaMA 3.1 70B (pairwise ranking)
- sentence-transformers (local embeddings)
- FAISS (local vector search)
- Pydantic v2 (data models)
- Pandas (CSV handling)
- Streamlit (UI)

All free-tier. No paid API required.

---

## Setup

```bash
git clone https://github.com/yourname/ai-candidate-ranking
cd ai-candidate-ranking
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in GEMINI_API_KEY and GROQ_API_KEY in .env
```

---

## Run (CLI)

```bash
python app/main.py --jd data/sample_jd.txt --candidates data/candidates.csv
```

Output: `outputs/ranked_results.csv` and `outputs/hiring_briefs.json`

---

## Run (Streamlit UI)

```bash
streamlit run ui/streamlit_app.py
```

Open: http://localhost:8501

---

## Run Tests

```bash
pytest tests/ -v
```

---

## Project Structure

```
app/           Entry points and config
schemas/       Pydantic data models
services/      Core pipeline services
utils/         Prompts, LLM client, helpers
ui/            Streamlit UI
data/          Sample JD and candidates
outputs/       Results (gitignored)
tests/         Unit and integration tests
docs/          PRD, TRS, design, prompts, etc.
```

---

## Documentation

- PRD: `docs/PRD_AI_Candidate_Ranking_System.md`
- TRS: `docs/TRS_AI_Candidate_Ranking_System.md`
- Design: `docs/design.md`
- Build Context: `docs/Build_Context_AI_Candidate_Ranking_System.md`
- Tasks: `docs/tasks.md`
- Prompts: `docs/prompts.md`
- API: `docs/api.md`
- Data Schema: `docs/data_schema.md`
- Elo Spec: `docs/elo_spec.md`
- UI Spec: `docs/ui_spec.md`
- Test Plan: `docs/test_plan.md`

---

## License
MIT
