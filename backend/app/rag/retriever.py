from __future__ import annotations

from typing import List

from app.db.repo import fetch_documents
from app.models import Preference, QueryStruct, RagDoc


def retrieve(query: QueryStruct, prefs: Preference, top_k: int = 12) -> List[RagDoc]:
    docs = fetch_documents(query, top_k)
    scored: List[RagDoc] = []
    for doc in docs:
        pref_score = 5 - abs(doc.sweet - prefs.sweet)
        pref_score += 5 - abs(doc.fruity - prefs.fruity)
        pref_score += 5 - abs(doc.crisp - prefs.crisp)
        keyword_score = 0
        content = f"{doc.title} {doc.content}".lower()
        for keyword in query.keywords:
            if keyword and keyword in content:
                keyword_score += 1
        score = keyword_score + pref_score / 3
        scored.append(doc.model_copy(update={"score": score}))
    scored.sort(key=lambda item: item.score, reverse=True)
    return scored[:top_k]
