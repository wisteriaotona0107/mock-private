from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.db.repo import init_db, seed_documents

app = FastAPI(title="Nested RAG 日本酒推薦 API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.on_event("startup")
def startup() -> None:
    base_dir = Path(__file__).resolve().parents[2]
    seed_path = base_dir / "documents_seed.json"
    init_db()
    seed_documents(seed_path)
