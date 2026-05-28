# platform_signals.md
# AI Candidate Ranking System — Platform Activity Signal Spec
**Version:** 1.0.0
**Date:** May 28, 2026

---

## Why Platform Signals Matter

Resume text is self-reported. Platform activity is behavioral evidence — it shows
what a candidate actually does, not just what they claim.

Adding platform signals completes the "full picture" requirement:
- Career history → trajectory scoring (already built)
- Skills → hard filter + semantic match (already built)
- Behavioral language → signal scoring (already built)
- Platform activity → this spec

---

## Supported Platforms (V1)

### GitHub (Primary — Fully Free)
GitHub has a public REST API with no auth required for basic data.
Rate limit: 60 requests/hour unauthenticated, 5000/hour with token.
A free GitHub token is sufficient for hackathon scale.

### Portfolio / Personal Site (Secondary — Free)
If candidate provides a URL, fetch and extract content.

### LinkedIn (Excluded from V1)
LinkedIn restricts scraping and has no free API.
Do not attempt in V1. Mark as future extension.

---

## GitHub Signal Extraction

### Input
Candidate CSV should include an optional `github_username` column.

### API Endpoints to Call

**1. User profile**
```
GET https://api.github.com/users/{username}
```
Extract:
- public_repos
- followers
- following
- created_at (account age)

**2. Repositories**
```
GET https://api.github.com/users/{username}/repos?sort=updated&per_page=10
```
Extract per repo:
- name
- description
- language
- stargazers_count
- forks_count
- updated_at
- topics

**3. Contribution events (recent activity)**
```
GET https://api.github.com/users/{username}/events/public?per_page=30
```
Extract:
- PushEvent count (commit frequency)
- PullRequestEvent count
- IssuesEvent count
- last active date

---

## GitHub Scoring Dimensions

Score each of the following 0 to 100:

### 1. Activity Score
Measures how recently and frequently the candidate codes publicly.

Signals:
- Last push event within 30 days → high
- Last push event within 90 days → medium
- No activity in 6+ months → low

### 2. Portfolio Strength
Measures the quality and visibility of their public work.

Signals:
- Repos with stars > 10 → strong
- Repos with descriptions and README → evidence of communication
- Pinned repos with topics → well-organized

### 3. Language Relevance
Measures how well their GitHub language usage aligns with the JD.

Signals:
- Primary language matches JD required skill → high
- Secondary language matches preferred skill → medium
- No language overlap → low

### 4. Collaboration Score
Measures evidence of working with others.

Signals:
- Has forks of other repos → contributes to open source
- Has PRs merged in external repos → collaborator
- Has followers > 20 → recognized in community

---

## GitHub Score Object

```python
class GitHubSignals(BaseModel):
    username: str
    account_age_years: float
    public_repos: int
    total_stars: int
    top_languages: list[str]
    activity_score: int        # 0-100
    portfolio_strength: int    # 0-100
    language_relevance: int    # 0-100
    collaboration_score: int   # 0-100
    final_github_score: int    # 0-100 weighted average
    summary: str               # 1 sentence summary
    profile_url: str
```

---

## Portfolio / URL Signal Extraction

### Input
Candidate CSV includes optional `portfolio_url` column.

### What to Fetch
- Use `httpx` or `requests` to GET the URL
- Extract text content using `BeautifulSoup`
- Send to LLM for structured signal extraction

### LLM Prompt for Portfolio Analysis

```
Analyze this portfolio or personal site content and return JSON:

{
  "has_projects": boolean,
  "project_count": integer,
  "has_case_studies": boolean,
  "has_technical_writing": boolean,
  "has_quantified_results": boolean,
  "technologies_mentioned": ["list"],
  "quality_signal": "High or Medium or Low",
  "summary": "1 sentence"
}

Content:
{{page_text}}
```

---

## Combined Platform Score

Weight GitHub and portfolio signals into a single platform score:

```
platform_score = (github_score * 0.7) + (portfolio_score * 0.3)
```

If only one source is available, use that source alone at full weight.
If neither is available, platform_score = None and confidence is penalized.

---

## Integration into Pipeline

### Where It Fits
Platform signal extraction runs after candidate ingestion, before behavioral scoring.

Updated pipeline:
```
Candidate ingestion
  → Hard filter
  → Platform signal extraction (GitHub + portfolio, async)
  → Semantic embedding shortlist
  → Behavioral scoring (text-based)
  → Combine platform + behavioral into composite score
  → Pairwise reranking
  → Confidence engine (now includes platform data completeness)
  → Hiring brief
```

### Composite Score Formula
```
composite_score = (
  semantic_score * 0.20 +
  behavioral_score * 0.45 +
  platform_score * 0.35
)
```

If platform data is unavailable:
```
composite_score = (
  semantic_score * 0.25 +
  behavioral_score * 0.75
)
```

---

## Updated Candidate Schema

Add to `schemas/candidate.py`:

```python
class Candidate(BaseModel):
    id: str
    name: str
    current_role: str
    experience_years: float
    skills: list[str]
    summary: str
    achievements: list[str] = []
    raw_text: str
    github_username: str | None = None
    portfolio_url: str | None = None
    github_signals: GitHubSignals | None = None
    portfolio_signals: dict | None = None
    platform_score: int | None = None
```

---

## Updated CSV Input Schema

Add optional columns to candidates.csv:

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| github_username | str | No | GitHub handle without @ |
| portfolio_url | str | No | Full URL with https:// |

---

## Updated Confidence Logic

Platform data presence now affects confidence:

- Has GitHub + portfolio + strong scores → confidence boost
- Has GitHub but sparse activity → neutral
- No GitHub, no portfolio → confidence penalty (Low unless behavioral score is very high)

---

## New Service File

**File:** `services/platform_scorer.py`

Functions to implement:

```python
async def fetch_github_signals(username: str, jd: JobDescription) -> GitHubSignals
def score_github(data: dict, jd: JobDescription) -> GitHubSignals
async def fetch_portfolio_signals(url: str) -> dict
def combine_platform_score(github: GitHubSignals | None, portfolio: dict | None) -> int
```

---

## Rate Limiting and Caching

- GitHub unauthenticated: 60 req/hour → use token for 5000/hour
- Cache GitHub responses in memory during a session
- Skip platform fetch if candidate has no github_username and no portfolio_url
- Timeout: 5 seconds per fetch, skip on timeout

---

## Environment Variables to Add

```
GITHUB_TOKEN=your_github_personal_access_token
```

GitHub personal access tokens are free and take 30 seconds to generate at github.com/settings/tokens.

---

## Hackathon Demo Angle

During demo, show this side-by-side:

Candidate A:
- Resume: "contributed to ML projects"
- GitHub: 47 public repos, primary language Python, last push 3 days ago, 2 repos with 100+ stars

Candidate B:
- Resume: "led ML infrastructure at scale"
- GitHub: no account found

This contrast makes the platform signal layer immediately understandable and visually compelling.
