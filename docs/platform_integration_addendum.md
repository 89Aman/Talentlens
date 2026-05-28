# platform_integration_addendum.md
# Design Addendum — Platform Signals Integration
**Version:** 1.1.0
**Date:** May 28, 2026

This document updates design.md and data_schema.md to reflect the addition
of platform activity signals (GitHub + Portfolio) into the pipeline.

---

## What Changed

The original 5-layer pipeline did not cover "platform activity" as a signal source.
This addendum adds a new service (platform_scorer.py) and integrates it between
candidate ingestion and behavioral scoring.

---

## Updated Pipeline (6 Effective Layers)

```
Layer 0: Input
  JD text + Candidate CSV (with optional github_username, portfolio_url columns)

Layer 1: Dynamic Rubric Generation
  LLM reads JD → role-specific scoring dimensions + weights
  (unchanged)

Layer 2: Hard Filter
  Rule-based elimination of must-have failures
  (unchanged)

Layer 3: Platform Signal Extraction  ← NEW
  GitHub API → activity, portfolio strength, language relevance, collaboration
  Portfolio URL → project depth, case studies, quantified results
  Combined into platform_score per candidate

Layer 4: Semantic Pool Filter
  Embeddings + FAISS → Top-50 shortlist
  (unchanged)

Layer 5: Behavioral Signal Scoring
  LLM scores quantified impact, ownership, trajectory from resume text
  (unchanged)

Layer 6: Composite Score Assembly  ← NEW
  Combine semantic + behavioral + platform into one composite score
  Use this for Top-20 selection instead of behavioral alone

Layer 7: Pairwise LLM Re-Ranking
  Head-to-head comparison includes platform evidence in context
  (updated prompt)

Layer 8: Confidence Engine
  Now penalizes missing platform data
  Boosts confidence for candidates with strong GitHub presence

Layer 9: Hiring Brief
  Brief now optionally references GitHub stats if available
  (updated prompt)

Layer 10: Output
  CSV includes platform_score and github_url columns
  UI shows GitHub stats in candidate detail panel
```

---

## Updated Composite Score Formula

When platform data is available:
```
composite = semantic(0.20) + behavioral(0.45) + platform(0.35)
```

When platform data is unavailable:
```
composite = semantic(0.25) + behavioral(0.75)
```

---

## Updated Pairwise Prompt Context

Add to existing pairwise prompt when GitHub data exists:

```
Additional context:
Candidate A GitHub: {{github_summary_a}}
Candidate B GitHub: {{github_summary_b}}

Factor this into your comparison if relevant to the role.
```

---

## Updated Hiring Brief Prompt Context

Add when GitHub data exists:

```
Platform signals:
GitHub: {{github_summary}}
Portfolio: {{portfolio_summary}}

Reference specific platform evidence if it strengthens or weakens the fit case.
```

---

## New File to Add

services/platform_scorer.py

Responsibilities:
- fetch_github_signals(username, jd) -> GitHubSignals
- fetch_portfolio_signals(url) -> dict
- combine_platform_score(github, portfolio) -> int

---

## Files Updated by This Addendum

- schemas/candidate.py → add github_username, portfolio_url, github_signals, platform_score
- schemas/ranking.py → add platform_score to RankedCandidate
- utils/prompts.py → update pairwise and brief prompts with platform context
- services/pairwise_ranker.py → pass platform summary into comparison prompt
- services/brief_generator.py → include platform evidence in brief
- services/confidence_engine.py → penalize/boost based on platform presence
- app/main.py → add platform_scorer step before behavioral scoring
- ui/streamlit_app.py → add GitHub stats section to candidate detail panel
- data/candidates.csv → add github_username and portfolio_url columns to sample data

---

## Updated tasks.md Phase

Add new Phase 6.5 between Phase 6 (Rubric) and Phase 7 (Behavioral):

Phase 6.5: Platform Signal Extraction
- [ ] Get free GitHub personal access token
- [ ] Add GITHUB_TOKEN to .env
- [ ] Write services/platform_scorer.py
  - [ ] fetch_github_signals() using httpx
  - [ ] score activity, portfolio strength, language relevance, collaboration
  - [ ] fetch_portfolio_signals() using httpx + BeautifulSoup
  - [ ] combine_platform_score()
- [ ] Update Candidate schema with new fields
- [ ] Add github_username and portfolio_url to sample candidates.csv
- [ ] Test: 5 candidates with GitHub usernames return valid GitHubSignals
- [ ] Test: graceful skip when username is None

Done when: Platform scores appear in composite score and are visible in UI
