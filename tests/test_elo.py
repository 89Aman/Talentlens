import pytest
from app.utils.elo import expected_score, update_elo

def test_elo_expected_score():
    # Equal ratings should yield 0.5 probability
    assert expected_score(1500, 1500) == 0.5
    
    # Higher rating should yield higher probability
    assert expected_score(1600, 1400) > 0.5
    assert expected_score(1400, 1600) < 0.5

def test_elo_updates():
    r_a, r_b = 1500.0, 1500.0
    
    # A wins
    new_a, new_b = update_elo(r_a, r_b, "candidate_a", k=20)
    assert new_a == 1510.0
    assert new_b == 1490.0
    
    # B wins
    new_a, new_b = update_elo(r_a, r_b, "candidate_b", k=20)
    assert new_a == 1490.0
    assert new_b == 1510.0
