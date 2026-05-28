# elo_spec.md
# Elo Algorithm Specification
# AI Candidate Ranking System
**Version:** 1.0.0
**Date:** May 28, 2026

---

## Why Elo

Elo is a relative rating system originally designed for chess tournaments.
It is ideal for candidate ranking because:
- We don't need a perfect absolute score for each candidate
- We need to know who is stronger relative to others for a specific role
- Repeated comparisons smooth out LLM inconsistency
- The final Elo rating is naturally interpretable as relative strength

---

## How It Works

### Step 1: Initialize
Every candidate in the Top-20 starts at a base rating of 1500.

### Step 2: Compare
For every pair (A, B), the LLM declares a winner.

### Step 3: Expected Score
Before each match, compute the expected outcome probability:

```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))
E_B = 1 - E_A
```

Where:
- R_A = current rating of candidate A
- R_B = current rating of candidate B
- E_A = probability A wins

### Step 4: Update Ratings
After the match:

```
R_A_new = R_A + K * (S_A - E_A)
R_B_new = R_B + K * (S_B - E_B)
```

Where:
- K = sensitivity factor (use 24 for hackathon)
- S_A = 1.0 if A wins, 0.0 if B wins
- S_B = 1.0 if B wins, 0.0 if A wins

### Step 5: Rank
Sort all candidates by final Elo rating descending. Highest = Rank 1.

---

## Worked Example

Three candidates: Alice (1500), Bob (1500), Carol (1500)

**Match 1: Alice vs Bob**
- E_Alice = 1 / (1 + 10^0) = 0.5
- LLM says Alice wins
- Alice_new = 1500 + 24*(1 - 0.5) = 1512
- Bob_new = 1500 + 24*(0 - 0.5) = 1488

**Match 2: Alice vs Carol**
- E_Alice = 1 / (1 + 10^0) = 0.5
- LLM says Carol wins
- Alice_new = 1512 + 24*(0 - 0.5) = 1500
- Carol_new = 1500 + 24*(1 - 0.5) = 1512

**Match 3: Bob vs Carol**
- E_Bob = 1 / (1 + 10^((1512-1488)/400)) = 0.466
- LLM says Carol wins
- Bob_new = 1488 + 24*(0 - 0.466) = 1477
- Carol_new = 1512 + 24*(1 - 0.534) = 1523

**Final ranking:**
1. Carol: 1523
2. Alice: 1500
3. Bob: 1477

---

## Implementation

```python
def expected_score(rating_a: float, rating_b: float) -> float:
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

def update_elo(
    rating_a: float,
    rating_b: float,
    winner: str,
    k: int = 24
) -> tuple[float, float]:
    e_a = expected_score(rating_a, rating_b)
    e_b = 1 - e_a
    if winner == "a":
        s_a, s_b = 1.0, 0.0
    else:
        s_a, s_b = 0.0, 1.0
    new_a = rating_a + k * (s_a - e_a)
    new_b = rating_b + k * (s_b - e_b)
    return new_a, new_b
```

---

## Configuration

| Parameter | Default | Notes |
|-----------|---------|-------|
| Base rating | 1500 | Standard Elo base |
| K factor | 24 | Controls sensitivity per match |
| Max candidates | 20 | Bounds total comparisons to 190 |

---

## Confidence from Elo

After the tournament, derive confidence from rating separation:

- **High confidence:** Elo > 1550 and nearest neighbor gap > 30
- **Medium confidence:** Elo between 1480 and 1550
- **Low confidence:** Elo < 1480 OR gap to next candidate < 10

A small gap means the system is unsure between two similarly-ranked candidates.

---

## Limitations

- Elo rewards consistency, not peak performance
- With 20 candidates and 190 comparisons, convergence is generally stable
- LLM inconsistency in borderline pairs may introduce noise — accept this
- Do not use Elo for fewer than 6 candidates (not enough matches for convergence)
