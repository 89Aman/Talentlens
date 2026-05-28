# prompts.md
# AI Candidate Ranking System — LLM Prompt Templates
**Version:** 1.0.0
**Date:** May 28, 2026

All prompts are stored here centrally. Import from `utils/prompts.py`.
Every prompt expects structured JSON output. Always include retry logic on parse failure.

---

## Prompt 1: JD Extraction

**Used in:** `services/jd_parser.py`
**Provider:** Gemini 1.5 Flash
**Purpose:** Extract structured fields from a raw job description

### System Prompt
```
You are an expert job description analyst. Extract structured information from job descriptions accurately. Always return valid JSON only, with no explanation or markdown.
```

### User Prompt
```
Extract the following from this job description and return as JSON:

{
  "title": "string",
  "required_skills": ["list of must-have skills"],
  "preferred_skills": ["list of nice-to-have skills"],
  "min_experience_years": integer,
  "responsibilities": ["list of key responsibilities"],
  "culture_signals": ["team culture or value signals if any"]
}

Job Description:
{{jd_text}}
```

### Validation Rules
- `min_experience_years` defaults to 0 if not mentioned
- `preferred_skills` defaults to empty list if not mentioned
- `culture_signals` defaults to empty list if not mentioned

---

## Prompt 2: Dynamic Rubric Generation

**Used in:** `services/rubric_generator.py`
**Provider:** Gemini 1.5 Flash
**Purpose:** Generate role-specific evaluation rubric from JD

### System Prompt
```
You are an expert technical recruiter. Given a job description, generate a role-specific candidate evaluation rubric. Return valid JSON only with no explanation or markdown.
```

### User Prompt
```
Based on this job description, generate an evaluation rubric for ranking candidates.

Return exactly this JSON structure:
{
  "dimensions": [
    {
      "name": "dimension name",
      "weight": 0.25,
      "description": "what this dimension measures",
      "scoring_guide": "what strong vs weak evidence looks like"
    }
  ]
}

Rules:
- Generate 4 to 6 dimensions
- All weights must sum to exactly 1.0
- Dimensions must be specific to this role, not generic
- Avoid vague dimensions like "overall fit"

Job Title: {{title}}
Job Description Summary: {{jd_summary}}
Required Skills: {{required_skills}}
Key Responsibilities: {{responsibilities}}
```

### Validation Rules
- Sum of weights must equal 1.0 (within 0.01 tolerance)
- Minimum 4 dimensions, maximum 6
- Each dimension must have non-empty name, description, and scoring_guide

---

## Prompt 3: Behavioral Signal Scoring

**Used in:** `services/behavioral_scorer.py`
**Provider:** Gemini 1.5 Flash or Groq
**Purpose:** Score how well a candidate's language demonstrates evidence of quality

### System Prompt
```
You are an expert talent assessor. Analyze candidate profiles for evidence quality, not just keyword presence. Return valid JSON only.
```

### User Prompt
```
Evaluate this candidate profile for behavioral signal quality.

Score each dimension from 0 to 100 and cite specific evidence from the text.

Return this JSON structure:
{
  "quantified_impact_score": integer,
  "quantified_impact_evidence": "quote or summary from profile",
  "ownership_scope_score": integer,
  "ownership_scope_evidence": "quote or summary from profile",
  "trajectory_velocity_score": integer,
  "trajectory_velocity_evidence": "quote or summary",
  "rubric_alignment_score": integer,
  "rubric_alignment_evidence": "which rubric dimensions they match",
  "final_behavioral_score": integer,
  "summary": "2 sentence summary of candidate signal strength"
}

Scoring guides:
- quantified_impact: Does the candidate use numbers, percentages, scale, revenue?
- ownership_scope: Did they lead, build, own, architect — or just "contributed to"?
- trajectory_velocity: Are there signs of growth, promotions, expanding responsibilities?
- rubric_alignment: How well does their experience map to the role rubric?

Role: {{jd_title}}
Rubric dimensions: {{rubric_summary}}

Candidate Profile:
{{candidate_text}}
```

### Validation Rules
- All scores must be integers between 0 and 100
- `final_behavioral_score` must be between 0 and 100
- Evidence fields must not be empty for scores above 50

---

## Prompt 4: Pairwise Comparison

**Used in:** `services/pairwise_ranker.py`
**Provider:** Groq (LLaMA 3.1 70B)
**Purpose:** Compare two candidates for a specific role and declare a winner

### System Prompt
```
You are a senior technical hiring manager. Compare two candidates for a specific role and decide who is the stronger fit. Return valid JSON only.
```

### User Prompt
```
Compare these two candidates for the following role and decide who is the stronger fit.

Return this JSON structure:
{
  "winner_id": "candidate_a or candidate_b",
  "rationale": "under 80 words explaining the decision",
  "deciding_dimension": "which rubric dimension decided this",
  "confidence": "High or Medium or Low"
}

Rules:
- You must choose one winner, never tie
- Cite specific evidence from both profiles
- Mention the rubric dimension that was most decisive

Role: {{jd_title}}
Evaluation Rubric: {{rubric_summary}}

Candidate A (ID: candidate_a):
{{candidate_a_text}}

Candidate B (ID: candidate_b):
{{candidate_b_text}}
```

### Validation Rules
- `winner_id` must be exactly "candidate_a" or "candidate_b"
- `confidence` must be exactly "High", "Medium", or "Low"
- `rationale` must not be empty
- `deciding_dimension` must match one of the rubric dimension names

---

## Prompt 5: Hiring Brief Generation

**Used in:** `services/brief_generator.py`
**Provider:** Gemini 1.5 Flash
**Purpose:** Generate a recruiter-ready summary and interview prompt per finalist

### System Prompt
```
You are an expert recruiter writing concise, evidence-based candidate summaries. Write clearly and directly. No filler language. Return valid JSON only.
```

### User Prompt
```
Generate a recruiter hiring brief for this candidate.

Return this JSON structure:
{
  "fit_summary": "1-2 sentences: why they fit this role with specific evidence",
  "gap_summary": "1 sentence: key gap or area to probe",
  "interview_question": "1 tailored question based on their specific background"
}

Rules:
- Use specific evidence from the candidate profile
- Do not use generic filler phrases like "strong communicator" without evidence
- Interview question must be specific to their experience, not generic

Role: {{jd_title}}
Rubric: {{rubric_summary}}

Candidate Profile:
{{candidate_text}}

Behavioral Score Summary:
{{behavioral_summary}}
```

### Validation Rules
- All three fields must be non-empty
- `fit_summary` must reference specific evidence
- `interview_question` must be a question (ends with ?)

---

## Prompt Usage Notes

### JSON Parsing
Always wrap LLM calls in a try/except and retry on JSON parse failure:
- Retry up to 3 times with same prompt
- On third failure, log warning and return default empty schema

### Token Budgeting
Approximate token usage per call:
- Rubric generation: ~400 tokens input + ~300 output
- Behavioral scoring: ~600 tokens input + ~400 output
- Pairwise comparison: ~800 tokens input + ~200 output
- Hiring brief: ~500 tokens input + ~250 output

For 100 candidates:
- Behavioral scoring: ~100,000 input tokens
- 190 pairwise comparisons: ~190,000 input tokens
- Hiring brief (top 10): ~5,000 input tokens

Gemini Flash free tier limit: 1,000,000 tokens/day
Groq free tier: ~14,400 requests/day

Route pairwise comparisons to Groq to preserve Gemini quota.

### Rate Limiting
Add `time.sleep(0.5)` between LLM calls for Groq.
Add `time.sleep(0.2)` between calls for Gemini Flash.
