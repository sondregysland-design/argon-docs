export function ConfidenceBadge({
  confidence,
  compact = false,
}: {
  confidence: number;
  compact?: boolean;
}) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 90
      ? "text-success bg-success/10"
      : pct >= 70
        ? "text-warning bg-warning/10"
        : "text-danger bg-danger/10";

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded ${color}`}
      >
        <span
          className={`inline-block h-1 w-1 rounded-full ${
            pct >= 90 ? "bg-success" : pct >= 70 ? "bg-warning" : "bg-danger"
          }`}
        />
        {pct}%
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg ${color}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          pct >= 90 ? "bg-success" : pct >= 70 ? "bg-warning" : "bg-danger"
        } ${pct >= 90 ? "animate-pulse-dot" : ""}`}
      />
      {pct}% konfidens
    </span>
  );
}
