def expected_score(rating_a: float, rating_b: float) -> float:
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

def update_elo(
    rating_a: float,
    rating_b: float,
    winner: str,
    k: int = 24
) -> tuple[float, float]:
    e_a = expected_score(rating_a, rating_b)
    e_b = 1.0 - e_a
    
    if winner == "candidate_a" or winner == "a":
        s_a, s_b = 1.0, 0.0
    else:
        s_a, s_b = 0.0, 1.0
        
    new_a = rating_a + k * (s_a - e_a)
    new_b = rating_b + k * (s_b - e_b)
    return new_a, new_b
