# JD Extraction Prompt
JD_EXTRACTION_SYSTEM = "You are an expert job description analyst. Extract structured information from job descriptions accurately. Always return valid JSON only, with no explanation or markdown."

JD_EXTRACTION_USER = """Extract the following from this job description and return as JSON:

{
  "title": "string",
  "required_skills": ["list of must-have skills"],
  "preferred_skills": ["list of nice-to-have skills"],
  "min_experience_years": integer,
  "responsibilities": ["list of key responsibilities"],
  "culture_signals": ["team culture or value signals if any"]
}

Job Description:
{jd_text}
"""

# Dynamic Rubric Generation Prompt
RUBRIC_GENERATION_SYSTEM = "You are an expert technical recruiter. Given a job description, generate a role-specific candidate evaluation rubric. Return valid JSON only with no explanation or markdown."

RUBRIC_GENERATION_USER = """Based on this job description, generate an evaluation rubric for ranking candidates.

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

Job Title: {title}
Job Description Summary: {jd_summary}
Required Skills: {required_skills}
Key Responsibilities: {responsibilities}
"""

# Behavioral Signal Scoring Prompt
BEHAVIORAL_SCORING_SYSTEM = "You are an expert talent assessor. Analyze candidate profiles for evidence quality, not just keyword presence. Return valid JSON only."

BEHAVIORAL_SCORING_USER = """Evaluate this candidate profile for behavioral signal quality.

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

Role: {jd_title}
Rubric dimensions: {rubric_summary}

Candidate Profile:
{candidate_text}
"""

# Pairwise Comparison Prompt
PAIRWISE_COMPARISON_SYSTEM = "You are a senior technical hiring manager. Compare two candidates for a specific role and decide who is the stronger fit. Return valid JSON only."

PAIRWISE_COMPARISON_USER = """Compare these two candidates for the following role and decide who is the stronger fit.

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

Role: {jd_title}
Evaluation Rubric: {rubric_summary}

Candidate A (ID: candidate_a):
{candidate_a_text}

Candidate B (ID: candidate_b):
{candidate_b_text}
"""

# Hiring Brief Prompt
HIRING_BRIEF_SYSTEM = "You are an expert recruiter writing concise, evidence-based candidate summaries. Write clearly and directly. No filler language. Return valid JSON only."

HIRING_BRIEF_USER = """Generate a recruiter hiring brief for this candidate.

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

Role: {jd_title}
Rubric: {rubric_summary}

Candidate Profile:
{candidate_text}

Behavioral Score Summary:
{behavioral_summary}
"""
