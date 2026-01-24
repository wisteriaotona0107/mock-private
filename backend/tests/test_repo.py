import json
from datetime import datetime

import sqlite3

from app.db.repo import init_db, save_feedback, save_interaction


def test_repo_saves_interaction_and_feedback(tmp_path):
    db_path = tmp_path / "test.db"
    init_db(str(db_path))

    save_interaction(
        request_id="req-1",
        user_text="test",
        prefs_json=json.dumps({"sweet": 3}),
        query_json=json.dumps({"keywords": ["test"]}),
        retrieved_doc_ids_json=json.dumps(["doc-1"]),
        candidates_json=json.dumps([]),
        scores_json=json.dumps({}),
        selected_candidate_id="conservative",
        created_at=datetime.utcnow(),
        db_path=str(db_path),
    )

    save_feedback(
        request_id="req-1",
        rating="good",
        selected="conservative",
        comment="nice",
        created_at=datetime.utcnow(),
        db_path=str(db_path),
    )

    conn = sqlite3.connect(db_path)
    interaction_count = conn.execute("SELECT COUNT(*) FROM interaction_log").fetchone()[0]
    feedback_count = conn.execute("SELECT COUNT(*) FROM feedback").fetchone()[0]
    conn.close()

    assert interaction_count == 1
    assert feedback_count == 1
