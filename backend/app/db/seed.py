from __future__ import annotations

from pathlib import Path

from app.db.repo import init_db, seed_documents


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parents[3]
    seed_path = base_dir / "documents_seed.json"
    init_db()
    seed_documents(seed_path)
    print("Database initialized and seeded.")
