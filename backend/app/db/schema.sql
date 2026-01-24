CREATE TABLE IF NOT EXISTS documents (
    doc_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    tags_json TEXT NOT NULL,
    sweet INTEGER NOT NULL,
    fruity INTEGER NOT NULL,
    crisp INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS interaction_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT NOT NULL,
    user_text TEXT NOT NULL,
    prefs_json TEXT NOT NULL,
    query_json TEXT NOT NULL,
    retrieved_doc_ids_json TEXT NOT NULL,
    candidates_json TEXT NOT NULL,
    scores_json TEXT NOT NULL,
    selected_candidate_id TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT NOT NULL,
    rating TEXT NOT NULL,
    selected TEXT NOT NULL,
    comment TEXT,
    created_at TEXT NOT NULL
);
