import { useState } from "react";
import RecommendForm from "./components/RecommendForm";
import ResultView from "./components/ResultView";
import { recommend, sendFeedback } from "./api";
import type { Candidate, Preference } from "./types";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [best, setBest] = useState<Candidate | null>(null);
  const [alternates, setAlternates] = useState<Candidate[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (userText: string, prefs: Preference) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await recommend({ user_text: userText, prefs });
      setBest(response.best);
      setAlternates(response.alternates);
      setRequestId(response.request_id);
    } catch (err) {
      setError("推薦の取得に失敗しました。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (
    rating: "good" | "meh" | "bad",
    selected: string
  ) => {
    if (!requestId) return;
    try {
      await sendFeedback({ request_id: requestId, rating, selected });
      alert("フィードバックを送信しました。ありがとうございます！");
    } catch (err) {
      setError("フィードバック送信に失敗しました。");
      console.error(err);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Nested RAG 日本酒推薦</h1>
        <p>要望に合わせておすすめの日本酒を3案提案します。</p>
      </header>

      <RecommendForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && <p className="error">{error}</p>}

      {best && (
        <ResultView
          best={best}
          alternates={alternates}
          onFeedback={handleFeedback}
        />
      )}
    </div>
  );
}
