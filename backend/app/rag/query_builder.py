from __future__ import annotations

import re
from typing import List

from app.models import Preference, QueryStruct


def _tokenize(text: str) -> List[str]:
    tokens = re.split(r"\s+", text)
    return [token.strip().lower() for token in tokens if token.strip()]


def build(user_text: str, prefs: Preference) -> QueryStruct:
    keywords = _tokenize(user_text)
    if prefs.pairing:
        keywords.extend(_tokenize(prefs.pairing))
    return QueryStruct(
        keywords=keywords[:12],
        pairing=prefs.pairing,
        budget_min=prefs.budget_min,
        budget_max=prefs.budget_max,
    )
