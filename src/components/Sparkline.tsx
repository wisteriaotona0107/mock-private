interface SparklineProps {
  values: number[];
}

const buildPoints = (values: number[]) => {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 100;
      const y = 30 - ((value - min) / range) * 30;
      return `${x},${y}`;
    })
    .join(" ");
};

export default function Sparkline({ values }: SparklineProps) {
  const points = buildPoints(values);
  return (
    <svg viewBox="0 0 100 30" className="sparkline">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
