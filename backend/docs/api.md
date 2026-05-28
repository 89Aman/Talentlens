# api.md
# AI Candidate Ranking System — API Contract
**Version:** 1.0.0
**Date:** May 28, 2026

This document defines the FastAPI endpoint contracts for the system.
Even if V1 runs as a CLI + Streamlit app, these contracts define the internal
service interfaces and are ready to be exposed as HTTP endpoints.

---

## Base URL (Local)
```
http://localhost:8000
```

---

## Endpoints

### POST /rank
Run the full ranking pipeline for a given JD and candidate dataset.

**Request (multipart/form-data):**
```
jd_text: string (optional if jd_file provided)
jd_file: file (.txt or .pdf)
candidates_file: file (.csv)
top_k_shortlist: int (default: 50)
top_k_final: int (default: 10)
```

**Response 200:**
```json
{
  "job_title": "Senior ML Engineer",
  "rubric": {
    "dimensions": [
      {
        "name": "ML System Depth",
        "weight": 0.30,
        "description": "Evidence of production ML work"
      }
    ]
  },
  "ranked_candidates": [
    {
      "rank": 1,
      "candidate_id": "c_001",
      "name": "Jane Doe",
      "semantic_score": 0.91,
      "behavioral_score": 84,
      "elo_score": 1687.5,
      "confidence": "High",
      "fit_summary": "Led ML infra at scale with quantified latency wins.",
      "gap_summary": "Limited experience with real-time serving pipelines.",
      "interview_question": "Walk me through how you optimized your training pipeline at XYZ."
    }
  ],
  "rejected_candidates": [
    {
      "candidate_id": "c_012",
      "name": "John Smith",
      "reason": "Below minimum experience: 1.5 years required 3"
    }
  ],
  "metadata": {
    "total_candidates": 50,
    "filtered_out": 12,
    "shortlisted": 20,
    "final_ranked": 10,
    "pipeline_duration_seconds": 87.4
  }
}
```

**Response 422:** Validation error (missing file or invalid format)
**Response 500:** Pipeline failure with error detail

---

### POST /rubric
Generate a rubric for a job description only (without running full pipeline).

**Request (JSON):**
```json
{
  "jd_text": "We are hiring a Senior ML Engineer..."
}
```

**Response 200:**
```json
{
  "generated_for": "Senior ML Engineer",
  "dimensions": [
    {
      "name": "ML System Depth",
      "weight": 0.30,
      "description": "Evidence of production ML experience",
      "scoring_guide": "Strong: trained models serving millions of req/day. Weak: classroom projects only."
    }
  ]
}
```

---

### POST /parse-jd
Parse a JD into structured fields.

**Request (JSON):**
```json
{
  "jd_text": "raw job description text"
}
```

**Response 200:**
```json
{
  "title": "Senior ML Engineer",
  "required_skills": ["Python", "PyTorch", "MLOps"],
  "preferred_skills": ["Kubernetes", "Ray"],
  "min_experience_years": 3,
  "responsibilities": ["Train and deploy ML models", "Own reliability of serving infra"],
  "culture_signals": ["high ownership", "fast-moving team"]
}
```

---

### POST /score-candidate
Score a single candidate against a JD and rubric (behavioral scoring only).

**Request (JSON):**
```json
{
  "candidate": {
    "name": "Jane Doe",
    "current_role": "ML Engineer",
    "experience_years": 4.5,
    "skills": ["Python", "TensorFlow", "Kubernetes"],
    "summary": "Built and deployed ML pipelines...",
    "achievements": ["Reduced inference latency by 40%"]
  },
  "jd_text": "raw JD text",
  "rubric": { ... }
}
```

**Response 200:**
```json
{
  "candidate_name": "Jane Doe",
  "quantified_impact_score": 82,
  "quantified_impact_evidence": "Reduced inference latency by 40%",
  "ownership_scope_score": 75,
  "ownership_scope_evidence": "Built and deployed independently",
  "trajectory_velocity_score": 68,
  "trajectory_velocity_evidence": "Promoted to senior in 2 years",
  "rubric_alignment_score": 80,
  "final_behavioral_score": 78,
  "summary": "Strong quantified impact with clear ownership."
}
```

---

### GET /health
Check if the service is running.

**Response 200:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

## Error Format
All error responses follow this format:
```json
{
  "error": "short error code",
  "detail": "human readable explanation",
  "stage": "which pipeline stage failed"
}
```

---

## Notes for V1
- No authentication required for hackathon
- All endpoints are synchronous (no async queue)
- Large candidate sets (500+) may take 3-5 minutes
- API keys loaded from .env on startup
