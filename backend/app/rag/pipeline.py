from __future__ import annotations

import json
import uuid
from datetime import datetime
from typing import Dict

from app.db.repo import save_interaction
from app.models import Candidate, EvaluationScore, Preference, QueryStruct
from app.rag import evaluator, generator, query_builder, retriever, selector


def run_pipeline(user_text: str, prefs: Preference) -> Dict[str, object]:
    request_id = str(uuid.uuid4())

    query_struct: QueryStruct = query_builder.build(user_text, prefs)
    docs = retriever.retrieve(query_struct, prefs)
    candidates = generator.generate_variants(user_text, prefs, docs)
    scores: Dict[str, EvaluationScore] = evaluator.evaluate(
        candidates, docs, user_text, prefs
    )
    best, alternates = selector.select(candidates, scores)

    save_interaction(
        request_id=request_id,
        user_text=user_text,
        prefs_json=prefs.model_dump_json(),
        query_json=query_struct.model_dump_json(),
        retrieved_doc_ids_json=json.dumps([doc.doc_id for doc in docs], ensure_ascii=False),
        candidates_json=json.dumps(
            [candidate.model_dump() for candidate in candidates], ensure_ascii=False
        ),
        scores_json=json.dumps(
            {key: score.model_dump() for key, score in scores.items()},
            ensure_ascii=False,
        ),
        selected_candidate_id=best.candidate_id,
        created_at=datetime.utcnow(),
    )

    return {
        "request_id": request_id,
        "best": best,
        "alternates": alternates,
        "debug": {
            "scores": {key: score.model_dump() for key, score in scores.items()},
            "retrieved_doc_ids": [doc.doc_id for doc in docs],
        },
    }
