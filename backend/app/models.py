from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field
from pydantic.config import ConfigDict


class Preference(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    sweet: int = Field(ge=0, le=5)
    fruity: int = Field(ge=0, le=5)
    crisp: int = Field(ge=0, le=5)
    pairing: Optional[str] = None
    budget_min: Optional[int] = Field(default=None, ge=0)
    budget_max: Optional[int] = Field(default=None, ge=0)


class RecommendRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    user_text: str = Field(min_length=1)
    prefs: Preference


class Citation(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    doc_id: str
    quote: str
    source: str


class Candidate(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    candidate_id: str
    text: str
    citations: List[Citation]


class EvaluationScore(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    faithfulness: int = Field(ge=0, le=5)
    preference_fit: int = Field(ge=0, le=5)
    actionability: int = Field(ge=0, le=5)
    violations: List[str]
    final_score: float


class RecommendResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    request_id: str
    best: Candidate
    alternates: List[Candidate]
    debug: Optional[dict] = None


class FeedbackRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    request_id: str
    rating: str = Field(pattern="^(good|meh|bad)$")
    selected: str
    comment: Optional[str] = None


class FeedbackRecord(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    request_id: str
    rating: str
    selected: str
    comment: Optional[str]
    created_at: datetime


class QueryStruct(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    keywords: List[str]
    pairing: Optional[str]
    budget_min: Optional[int]
    budget_max: Optional[int]


class RagDoc(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    doc_id: str
    title: str
    content: str
    source: str
    tags: List[str]
    sweet: int
    fruity: int
    crisp: int
    score: float


class InteractionLog(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    request_id: str
    user_text: str
    prefs_json: str
    query_json: str
    retrieved_doc_ids_json: str
    candidates_json: str
    scores_json: str
    selected_candidate_id: str
    created_at: datetime
