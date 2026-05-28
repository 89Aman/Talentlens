# TalentLens — AI Candidate Ranking System

TalentLens is an intelligent candidate evaluation and ranking system. It replaces keyword-based resume filtering with semantic search and comparative LLM reasoning to identify top talent for any job description.

---

## 1. System Architecture & Flow

The system evaluates candidates through a multi-stage pipeline designed to optimize accuracy, explainability, and resource utilization.

```
                  ┌────────────────────────┐
                  │ Job Description Input  │
                  └───────────┬────────────┘
                              │
                              ▼
                Layer 1: Dynamic Rubric Gen
                              │
                              ▼
                  ┌────────────────────────┐
                  │ Candidate Profiles CSV │
                  └───────────┬────────────┘
                              │
                              ▼
                 Layer 2: Hard Filter (Rule)
                              │
                              ▼
                 Layer 3: Semantic Pool (FAISS)
                              │ (Top-50)
                              ▼
                 Layer 4: Behavioral Scorer
                              │ (Top-20)
                              ▼
                 Layer 5: Pairwise Elo Match
                              │ (Top-10)
                              ▼
                 Layer 6: Dossiers & Briefs
```

### The 6 Pipeline Layers

1. **Dynamic Rubric Generation (Gemini 3.5 Flash)**
   * Parses the raw Job Description (JD) and generates 4 to 6 specific evaluation dimensions.
   * Assigns weights to each dimension so they sum to exactly `1.0`, ensuring custom alignment with the role.

2. **Deterministic Hard Filtering (Python Rules)**
   * Checks candidates against non-negotiable criteria (e.g., minimum years of experience, mandatory skill presence).
   * Discards unqualified candidates early to avoid expensive downstream API calls, logging the exact rejection reason.

3. **Semantic Pool Filtering (Sentence-Transformers & FAISS)**
   * Embeds the job description and candidate profiles using `all-MiniLM-L6-v2` locally.
   * Performs an inner product cosine similarity search using a local FAISS index.
   * Restricts the active candidate pool to the Top-50 semantic matches.

4. **Behavioral Signal Scoring (Gemini 3.5 Flash)**
   * Evaluates candidate achievements on 4 core behavioral indices (scored 0-100):
     * *Quantified Impact:* Evidence of metrics, scale, percentages, or revenue.
     * *Ownership Scope:* Proof of initiative and execution (e.g., "designed/led" vs. "assisted").
     * *Trajectory Velocity:* Indicators of career growth and promotions.
     * *Rubric Alignment:* Score mapping to the job description rubric.

5. **Pairwise Elo Re-ranking (LLaMA 3.1 70B via Groq)**
   * Selects the Top-20 candidates from the behavioral layer and runs a head-to-head tournament.
   * Generates a balanced matchmaking schedule where each candidate competes in up to 10 pairings.
   * For each match, LLaMA 3.1 70B decides who is a stronger fit. Ratings are updated using the standard **Elo chess rating algorithm**, sorting the candidates onto a relative leaderboard.

6. **Brief Generation & Confidence Tagging**
   * Computes a confidence rating (High, Medium, Low) based on the profile completeness and ELO separation margins.
   * Generates a customized hiring brief for the Top-10 finalists consisting of a fit summary, risk analysis/gap, and a specific interview question.

---

## 2. Directory Structure

```
TalentLens/
├── app/
│   ├── config.py                 # Environment configurations & API settings
│   ├── main.py                   # FastAPI backend implementation
│   ├── schemas/                  # Pydantic validation schemas
│   │   ├── candidate.py          # Candidate models
│   │   ├── jd.py                 # Job Description models
│   │   ├── rubric.py             # Evaluation rubric models
│   │   └── ranking.py            # Ranking models & outputs
│   ├── services/                 # Layer services
│   │   ├── jd_parser.py          # Gemini-based JD parser
│   │   ├── rubric_generator.py   # Layer 1: Dynamic rubric logic
│   │   ├── hard_filter.py        # Layer 2: Deterministic filters
│   │   ├── embedding_service.py  # Layer 3: Sentence-transformers & FAISS
│   │   ├── behavioral_scorer.py  # Layer 4: Qualitative scoring
│   │   ├── pairwise_ranker.py    # Layer 5: Match scheduling & Elo tournaments
│   │   ├── confidence_engine.py  # Layer 6: Confidence computations
│   │   └── brief_generator.py    # Layer 6: Brief & question generation
│   ├── ui/
│   │   └── streamlit_app.py      # Streamlit web interface
│   └── utils/                    # Common utils (Elo mathematics, templates)
├── data/                         # Sample datasets (sample_jd.txt, candidates.csv)
├── docs/                         # Documentation (PRD, designs)
├── tests/                        # Automated unit tests
└── requirements.txt              # Project package dependencies
```

---

## 3. Technology Stack

*   **API Framework:** FastAPI
*   **Web Dashboard:** Streamlit
*   **Local Embeddings:** `sentence-transformers/all-MiniLM-L6-v2`
*   **Vector Search:** FAISS (Facebook AI Similarity Search)
*   **Data Validation:** Pydantic v2
*   **Data Manipulation:** Pandas
*   **AI Orchestration:** Google Gemini 3.5 Flash (General parsing, scoring, and generation) and Groq LLaMA 3.1 70B (Comparative tournament re-ranking)

---

## 4. Setup & Running the Application

### 1. Environment Configuration
Create a `.env` file at the root of the project:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
HOST=127.0.0.1
```

### 2. Start the Backend API
Run the FastAPI backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Start the Streamlit Dashboard
Open a separate terminal window and launch the user interface:
```bash
streamlit run app/ui/streamlit_app.py
```
This will open the interface in your default web browser at `http://localhost:8501`.
