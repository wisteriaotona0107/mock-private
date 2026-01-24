from __future__ import annotations

from typing import Dict, List

from app.models import Candidate, EvaluationScore, Preference, RagDoc


def _has_hallucination(candidate: Candidate, docs: Dict[str, RagDoc]) -> bool:
    for citation in candidate.citations:
        doc = docs.get(citation.doc_id)
        if not doc:
            return True
        if citation.quote and citation.quote not in doc.content:
            return True
    return False


def evaluate(
    candidates: List[Candidate],
    docs: List[RagDoc],
    user_text: str,
    prefs: Preference,
) -> Dict[str, EvaluationScore]:
    doc_map = {doc.doc_id: doc for doc in docs}
    scores: Dict[str, EvaluationScore] = {}
    for candidate in candidates:
        violations: List[str] = []
        if not candidate.citations:
            violations.append("NO_CITATION")
        if _has_hallucination(candidate, doc_map):
            violations.append("HALLUCINATION")

        preference_fit = max(0, 5 - abs(prefs.sweet - prefs.fruity))
        actionability = 4 if "提案" in candidate.text else 3
        faithfulness = 5 if not violations else 2
        final_score = (preference_fit + actionability + faithfulness) / 3
        if violations:
            final_score -= 1.0

        scores[candidate.candidate_id] = EvaluationScore(
            faithfulness=faithfulness,
            preference_fit=preference_fit,
            actionability=actionability,
            violations=violations,
            final_score=round(final_score, 2),
        )
    return scores
