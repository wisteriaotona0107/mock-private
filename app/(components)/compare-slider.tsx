'use client';

import { useState } from 'react';

interface CompareSliderProps {
  beforeUrl: string;
  afterUrl: string;
}

export function CompareSlider({ beforeUrl, afterUrl }: CompareSliderProps) {
  const [position, setPosition] = useState(50);
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-slate-900" aria-label="before-after slider">
      <img src={afterUrl} alt="カラー化後" className="block w-full" />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img src={beforeUrl} alt="カラー化前" className="block w-full" />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2/3"
        aria-label="比較スライダー"
      />
    </div>
  );
}
