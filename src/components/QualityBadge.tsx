import type { QualityResult } from "../services/quality";

const badgeStyles: Record<QualityResult["badge"], string> = {
  OK: "badge badge-ok",
  注意: "badge badge-warn",
  要確認: "badge badge-alert",
};

export default function QualityBadge({ result }: { result: QualityResult }) {
  return (
    <div className={badgeStyles[result.badge]}>
      <div className="badge-label">{result.badge}</div>
      <div className="badge-score">{Math.round(result.score)}</div>
    </div>
  );
}
