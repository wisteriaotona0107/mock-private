import { useState } from "react";
import type { Candidate } from "../types";

type Props = {
  best: Candidate;
  alternates: Candidate[];
  onFeedback: (rating: "good" | "meh" | "bad", selected: string) => void;
};

export default function ResultView({ best, alternates, onFeedback }: Props) {
  const [showAlternates, setShowAlternates] = useState(false);

  return (
    <section className="results">
      <h2>ベスト提案</h2>
      <article className="card">
        <h3>{best.candidate_id}</h3>
        <p>{best.text}</p>
        <ul>
          {best.citations.map((citation) => (
            <li key={citation.doc_id}>
              <strong>{citation.doc_id}</strong>: {citation.quote}（{citation.source}）
            </li>
          ))}
        </ul>
        <div className="feedback">
          <button onClick={() => onFeedback("good", best.candidate_id)}>
            👍 good
          </button>
          <button onClick={() => onFeedback("meh", best.candidate_id)}>
            🙂 meh
          </button>
          <button onClick={() => onFeedback("bad", best.candidate_id)}>
            👎 bad
          </button>
        </div>
      </article>

      <button
        className="toggle"
        onClick={() => setShowAlternates((prev) => !prev)}
      >
        {showAlternates ? "代替案を閉じる" : "代替案を見る"}
      </button>

      {showAlternates && (
        <div className="alternates">
          {alternates.map((alt) => (
            <article className="card" key={alt.candidate_id}>
              <h3>{alt.candidate_id}</h3>
              <p>{alt.text}</p>
              <ul>
                {alt.citations.map((citation) => (
                  <li key={`${alt.candidate_id}-${citation.doc_id}`}>
                    <strong>{citation.doc_id}</strong>: {citation.quote}（
                    {citation.source}）
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
