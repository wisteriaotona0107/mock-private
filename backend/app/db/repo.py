from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import List

from app.models import QueryStruct, RagDoc

BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = BASE_DIR / "app.db"
SCHEMA_PATH = Path(__file__).with_name("schema.sql")


def get_connection(db_path: str | None = None) -> sqlite3.Connection:
    path = db_path or os.getenv("DATABASE_URL", str(DEFAULT_DB_PATH))
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: str | None = None) -> None:
    conn = get_connection(db_path)
    with conn:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    conn.close()


def seed_documents(seed_path: Path, db_path: str | None = None) -> None:
    conn = get_connection(db_path)
    with conn:
        existing = conn.execute("SELECT COUNT(*) as count FROM documents").fetchone()
        if existing and existing["count"] > 0:
            conn.close()
            return
        payload = json.loads(seed_path.read_text(encoding="utf-8"))
        for doc in payload:
            conn.execute(
                """
                INSERT INTO documents
                    (doc_id, title, content, source, tags_json, sweet, fruity, crisp)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    doc["doc_id"],
                    doc["title"],
                    doc["content"],
                    doc["source"],
                    json.dumps(doc.get("tags", []), ensure_ascii=False),
                    doc.get("sweet", 3),
                    doc.get("fruity", 3),
                    doc.get("crisp", 3),
                ),
            )
    conn.close()


def fetch_documents(query: QueryStruct, top_k: int) -> List[RagDoc]:
    conn = get_connection()
    like_clauses = []
    params: List[str] = []
    for keyword in query.keywords:
        like_clauses.append("content LIKE ?")
        params.append(f"%{keyword}%")
    where_clause = " OR ".join(like_clauses) if like_clauses else "1=1"
    sql = f"SELECT * FROM documents WHERE {where_clause} LIMIT ?"
    params.append(top_k)
    rows = conn.execute(sql, params).fetchall()
    conn.close()

    docs: List[RagDoc] = []
    for row in rows:
        docs.append(
            RagDoc(
                doc_id=row["doc_id"],
                title=row["title"],
                content=row["content"],
                source=row["source"],
                tags=json.loads(row["tags_json"]),
                sweet=row["sweet"],
                fruity=row["fruity"],
                crisp=row["crisp"],
                score=0.0,
            )
        )
    return docs


def save_interaction(
    request_id: str,
    user_text: str,
    prefs_json: str,
    query_json: str,
    retrieved_doc_ids_json: str,
    candidates_json: str,
    scores_json: str,
    selected_candidate_id: str,
    created_at: datetime,
    db_path: str | None = None,
) -> None:
    conn = get_connection(db_path)
    with conn:
        conn.execute(
            """
            INSERT INTO interaction_log
                (
                    request_id,
                    user_text,
                    prefs_json,
                    query_json,
                    retrieved_doc_ids_json,
                    candidates_json,
                    scores_json,
                    selected_candidate_id,
                    created_at
                )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                request_id,
                user_text,
                prefs_json,
                query_json,
                retrieved_doc_ids_json,
                candidates_json,
                scores_json,
                selected_candidate_id,
                created_at.isoformat(),
            ),
        )
    conn.close()


def save_feedback(
    request_id: str,
    rating: str,
    selected: str,
    comment: str | None,
    created_at: datetime,
    db_path: str | None = None,
) -> None:
    conn = get_connection(db_path)
    with conn:
        conn.execute(
            """
            INSERT INTO feedback (request_id, rating, selected, comment, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (request_id, rating, selected, comment, created_at.isoformat()),
        )
    conn.close()
