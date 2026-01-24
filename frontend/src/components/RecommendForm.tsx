import { useState } from "react";
import type { Preference } from "../types";

type Props = {
  onSubmit: (userText: string, prefs: Preference) => void;
  isLoading: boolean;
};

const defaultPrefs: Preference = {
  sweet: 3,
  fruity: 3,
  crisp: 3,
  pairing: "",
  budget_min: 0,
  budget_max: 5000,
};

export default function RecommendForm({ onSubmit, isLoading }: Props) {
  const [userText, setUserText] = useState("");
  const [prefs, setPrefs] = useState<Preference>(defaultPrefs);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(userText, prefs);
      }}
    >
      <label>
        要望
        <textarea
          value={userText}
          onChange={(event) => setUserText(event.target.value)}
          placeholder="どんな日本酒が飲みたいですか？"
          required
        />
      </label>

      <div className="slider-group">
        <label>
          甘味: {prefs.sweet}
          <input
            type="range"
            min={0}
            max={5}
            value={prefs.sweet}
            onChange={(event) =>
              setPrefs({ ...prefs, sweet: Number(event.target.value) })
            }
          />
        </label>
        <label>
          果実感: {prefs.fruity}
          <input
            type="range"
            min={0}
            max={5}
            value={prefs.fruity}
            onChange={(event) =>
              setPrefs({ ...prefs, fruity: Number(event.target.value) })
            }
          />
        </label>
        <label>
          キレ: {prefs.crisp}
          <input
            type="range"
            min={0}
            max={5}
            value={prefs.crisp}
            onChange={(event) =>
              setPrefs({ ...prefs, crisp: Number(event.target.value) })
            }
          />
        </label>
      </div>

      <label>
        ペアリング
        <input
          type="text"
          value={prefs.pairing}
          onChange={(event) =>
            setPrefs({ ...prefs, pairing: event.target.value })
          }
          placeholder="例: 白身魚、チーズ"
        />
      </label>

      <div className="budget">
        <label>
          予算下限 (円)
          <input
            type="number"
            min={0}
            value={prefs.budget_min}
            onChange={(event) =>
              setPrefs({ ...prefs, budget_min: Number(event.target.value) })
            }
          />
        </label>
        <label>
          予算上限 (円)
          <input
            type="number"
            min={0}
            value={prefs.budget_max}
            onChange={(event) =>
              setPrefs({ ...prefs, budget_max: Number(event.target.value) })
            }
          />
        </label>
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "提案中..." : "おすすめを生成"}
      </button>
    </form>
  );
}
