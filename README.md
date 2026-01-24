# Nested RAG 日本酒推薦 MVP

React + Vite + FastAPI + SQLiteで「Nested RAG 日本酒推薦」MVPを実装したサンプルです。Inner(生成)は3案を作り、Outer(評価)はJSON採点で1案選択し、結果とフィードバックを保存します。LLM呼び出しはダミー実装ですが、`ILLMClient`の差し替えで本番実装に移行できます。

## ディレクトリ構成

```
repo/
  backend/
    app/
      main.py
      api.py
      models.py
      rag/
        pipeline.py
        query_builder.py
        retriever.py
        generator.py
        evaluator.py
        selector.py
      db/
        schema.sql
        repo.py
        seed.py
    requirements.txt
  frontend/
    src/
      App.tsx
      api.ts
      types.ts
      components/
        RecommendForm.tsx
        ResultView.tsx
    index.html
    vite.config.ts
    package.json
  README.md
  documents_seed.json
```

## セットアップ

### バックエンド

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.db.seed
uvicorn app.main:app --reload
```

`python -m app.db.seed` でSQLite(`backend/app.db`)を初期化/seedします。起動時にも自動seedされます。

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開いて操作します。

## API 仕様

### POST /recommend

**Request**
```json
{
  "user_text": "白身魚に合うすっきりした日本酒がほしい",
  "prefs": {
    "sweet": 3,
    "fruity": 2,
    "crisp": 4,
    "pairing": "白身魚",
    "budget_min": 0,
    "budget_max": 5000
  }
}
```

**Response**
```json
{
  "request_id": "uuid",
  "best": {
    "candidate_id": "conservative",
    "text": "...",
    "citations": [
      { "doc_id": "doc-001", "quote": "...", "source": "..." }
    ]
  },
  "alternates": [
    { "candidate_id": "distinctive", "text": "...", "citations": [] },
    { "candidate_id": "constraint_opt", "text": "...", "citations": [] }
  ]
}
```

- 内部では query -> retrieve -> generate -> evaluate -> select を実施し、`interaction_log` に保存します。
- citationsが必須で、評価で`NO_CITATION`や`HALLUCINATION`がある候補は選抜対象外になります。

### POST /feedback

**Request**
```json
{
  "request_id": "uuid",
  "rating": "good",
  "selected": "conservative",
  "comment": "good choice"
}
```

**Response**
```json
{ "status": "ok" }
```

## DB 初期化スクリプト

```bash
cd backend
python -m app.db.seed
```

## テスト

```bash
cd backend
pytest
```

## 起動確認

1. `python -m app.db.seed`
2. `uvicorn app.main:app --reload`
3. `npm run dev`
4. ブラウザでフォーム入力 -> 推薦が返ることを確認
