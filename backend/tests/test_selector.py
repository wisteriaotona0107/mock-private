from app.models import Candidate, Citation, EvaluationScore
from app.rag.selector import select


def test_select_filters_disqualified_candidates():
    candidate_ok = Candidate(
        candidate_id="ok",
        text="提案",
        citations=[Citation(doc_id="doc-1", quote="sample", source="src")],
    )
    candidate_bad = Candidate(
        candidate_id="bad",
        text="提案",
        citations=[],
    )
    scores = {
        "ok": EvaluationScore(
            faithfulness=5,
            preference_fit=4,
            actionability=4,
            violations=[],
            final_score=4.3,
        ),
        "bad": EvaluationScore(
            faithfulness=1,
            preference_fit=1,
            actionability=1,
            violations=["NO_CITATION"],
            final_score=0.3,
        ),
    }

    best, alternates = select([candidate_bad, candidate_ok], scores)

    assert best.candidate_id == "ok"
    assert all(candidate.candidate_id != "ok" for candidate in alternates)
