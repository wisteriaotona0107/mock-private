from __future__ import annotations

from typing import Dict, List, Tuple

from app.models import Candidate, EvaluationScore


DISQUALIFY_VIOLATIONS = {"NO_CITATION", "HALLUCINATION"}


def select(
    candidates: List[Candidate],
    scores: Dict[str, EvaluationScore],
) -> Tuple[Candidate, List[Candidate]]:
    eligible: List[Candidate] = []
    for candidate in candidates:
        score = scores.get(candidate.candidate_id)
        if not score:
            continue
        if score.violations and DISQUALIFY_VIOLATIONS.intersection(score.violations):
            continue
        if not candidate.citations:
            continue
        eligible.append(candidate)

    if not eligible:
        eligible = candidates

    eligible.sort(
        key=lambda item: scores.get(item.candidate_id, EvaluationScore(
            faithfulness=0,
            preference_fit=0,
            actionability=0,
            violations=[],
            final_score=0,
        )).final_score,
        reverse=True,
    )

    best = eligible[0]
    alternates = [item for item in candidates if item.candidate_id != best.candidate_id][:2]
    return best, alternates
