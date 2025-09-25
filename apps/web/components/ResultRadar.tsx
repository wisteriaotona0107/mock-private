'use client';

import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface ResultRadarProps {
  scores: Record<string, number>;
}

export function ResultRadar({ scores }: ResultRadarProps) {
  const labels = Object.keys(scores);
  const data = {
    labels,
    datasets: [
      {
        label: 'スコア',
        data: labels.map((label) => scores[label] ?? 0),
        backgroundColor: 'rgba(56, 189, 248, 0.3)',
        borderColor: '#38bdf8',
        borderWidth: 1,
      },
    ],
  };

  return <Radar data={data} options={{ scales: { r: { suggestedMin: 0, suggestedMax: 100 } } }} />;
}
