from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter

from app.db.repo import save_feedback
from app.models import FeedbackRequest, RecommendRequest, RecommendResponse
from app.rag.pipeline import run_pipeline

router = APIRouter()


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(payload: RecommendRequest) -> RecommendResponse:
    result = run_pipeline(payload.user_text, payload.prefs)
    return RecommendResponse(**result)


@router.post("/feedback")
async def feedback(payload: FeedbackRequest) -> dict:
    save_feedback(
        request_id=payload.request_id,
        rating=payload.rating,
        selected=payload.selected,
        comment=payload.comment,
        created_at=datetime.utcnow(),
    )
    return {"status": "ok"}
