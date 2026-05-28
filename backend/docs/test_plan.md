# test_plan.md
# AI Candidate Ranking System — Test Plan
**Version:** 1.0.0
**Date:** May 28, 2026

---

## Testing Philosophy

Build tests layer by layer, starting with the most deterministic (schema, filters, Elo)
before testing the LLM-dependent services. Mock LLM calls in unit tests.

---

## Test Layers

### Layer 1: Schema Tests
**File:** `tests/test_schemas.py`

| Test | Input | Expected |
|------|-------|----------|
| Valid JobDescription | All required fields | Model instantiates cleanly |
| Missing required field | No title | Pydantic ValidationError |
| Valid Candidate | All fields | Model instantiates |
| Invalid experience_years | "three" string | ValidationError |
| Rubric weight sum = 1.0 | Weights 0.3+0.3+0.4 | Valid |
| Rubric weight sum != 1.0 | Weights 0.3+0.3+0.3 | ValidationError |
| RankedCandidate valid | Full object | Instantiates |

---

### Layer 2: Hard Filter Tests
**File:** `tests/test_hard_filter.py`

| Test | Input | Expected |
|------|-------|----------|
| Below min experience | 1.5yr required 3yr | Rejected with reason |
| Exactly min experience | 3yr required 3yr | Passes |
| Missing required skill | No Python, Python required | Rejected |
| Has all required skills | All present | Passes |
| All candidates valid | Clean list | Returns all |
| All candidates invalid | All fail | Returns empty list, full reject log |

---

### Layer 3: Elo Tests
**File:** `tests/test_elo.py`

| Test | Input | Expected |
|------|-------|----------|
| Equal ratings expected score | 1500 vs 1500 | 0.5 |
| Higher rating expected score | 1600 vs 1500 | > 0.5 |
| Lower rating expected score | 1400 vs 1500 | < 0.5 |
| Winner gains rating | A wins vs B | A_new > A_old |
| Loser loses rating | A wins vs B | B_new < B_old |
| Net rating conserved | Any match | A_new + B_new = A_old + B_old |
| Full tournament sort | 5 candidates | Sorted by final Elo |

---

### Layer 4: Embedding Tests
**File:** `tests/test_embedding.py`

| Test | Input | Expected |
|------|-------|----------|
| Embed single text | Short string | Returns numpy array |
| Embed JD | Full JD | Array length = model dim |
| Top-K retrieval | 20 candidates, k=5 | Returns 5 results sorted by score |
| Score range | Any | All scores between 0 and 1 |
| Correct top match | Highly relevant candidate | Ranked #1 |

---

### Layer 5: Pipeline Integration Test
**File:** `tests/test_pipeline.py`

| Test | Description |
|------|-------------|
| End-to-end smoke test | Run full pipeline on sample_jd.txt + 20 candidates |
| Output file created | ranked_results.csv exists after run |
| Output has correct columns | All required columns present |
| No empty briefs | All Top-10 have non-empty fit_summary |
| Confidence labels valid | All labels are High/Medium/Low |
| Ranking is unique | No duplicate ranks |

---

## LLM Mock Strategy

For unit tests, mock all LLM calls:

```python
from unittest.mock import patch

MOCK_RUBRIC_RESPONSE = {
    "dimensions": [
        {"name": "ML Depth", "weight": 0.4, "description": "...", "scoring_guide": "..."},
        {"name": "Ownership", "weight": 0.3, "description": "...", "scoring_guide": "..."},
        {"name": "Impact", "weight": 0.3, "description": "...", "scoring_guide": "..."}
    ]
}

@patch("utils.llm_client.call_gemini", return_value=json.dumps(MOCK_RUBRIC_RESPONSE))
def test_rubric_generation(mock_llm):
    rubric = generate_rubric(sample_jd)
    assert len(rubric.dimensions) == 3
    assert abs(sum(d.weight for d in rubric.dimensions) - 1.0) < 0.01
```

---

## Sample Test Data

### sample_jd.txt
```
Senior ML Engineer
We are looking for a senior ML engineer with 3+ years of experience
in training and deploying production ML models. Required: Python, PyTorch.
Preferred: MLOps, Kubernetes. You will own reliability of our ML platform.
```

### candidates.csv (minimum 20 rows)
Include:
- 3 candidates clearly above threshold
- 3 candidates clearly below threshold
- 5 edge cases (borderline experience, partial skill match)
- 5 strong candidates with quantified achievements
- 4 weak candidates with generic language only

---

## Running Tests

```bash
# All tests
pytest tests/ -v

# Schema only
pytest tests/test_schemas.py -v

# Elo only (fast, no LLM)
pytest tests/test_elo.py -v

# Integration (requires API keys)
pytest tests/test_pipeline.py -v --slow
```

---

## Acceptance Threshold
- All unit tests must pass before integration test
- Integration test must complete with valid ranked CSV
- No test should make real LLM calls (mock everything)
- Integration test may use real LLM calls but is marked `--slow`
