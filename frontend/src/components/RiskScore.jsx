
const RiskScore = ({ score = 0, riskLevel = "Low", matchedPatternId = null, matchedPatternDetails = null }) => {
  const safeScore = Math.min(100, Math.max(0, Number(score || 0)));
  const formattedScore = safeScore.toFixed(1).replace(/\.0$/, "");
  const authenticityScore = Math.max(0, Math.min(100, Number((100 - safeScore).toFixed(1))));
  const formattedAuthenticity = authenticityScore.toFixed(1).replace(/\.0$/, "");

  // Normalize risk level
  const normalizedLevel = (riskLevel || "Low").toLowerCase();

  let levelLabel = "Low Risk";
  let barColor = "#10b981"; // emerald-500
  let badgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300";

  if (normalizedLevel === "critical" || safeScore >= 85) {
    levelLabel = "Critical Risk - Scam";
    barColor = "#dc2626"; // red-600
    badgeBg = "bg-red-100 text-red-800 border-red-300";
  } else if (normalizedLevel === "high" || safeScore >= 70) {
    levelLabel = "High Risk - Suspicious";
    barColor = "#f97316"; // orange-500
    badgeBg = "bg-orange-100 text-orange-800 border-orange-300";
  } else if (normalizedLevel === "medium" || safeScore >= 35) {
    levelLabel = "Medium Risk - Exercise Caution";
    barColor = "#f59e0b"; // amber-500
    badgeBg = "bg-amber-100 text-amber-800 border-amber-300";
  } else {
    levelLabel = "Low Risk - Verified Safe";
    barColor = "#10b981"; // emerald-500
    badgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300";
  }

  const isAuthentic = authenticityScore >= 65;

  return (
    <div className="w-full rounded-2xl bg-[#ebf1f4] p-5 shadow-[6px_6px_14px_rgba(163,177,198,0.2),-6px_-6px_14px_rgba(255,255,255,0.9)] border border-white/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xl font-lexend font-bold text-slate-800">
            Threat Assessment:
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
            {levelLabel}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              isAuthentic
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAuthentic ? "bg-emerald-500" : "bg-slate-400"}`} />
            <span>Authenticity Index: <strong>{formattedAuthenticity}%</strong></span>
          </span>
        </div>

        <div className="text-left sm:text-right flex items-baseline sm:justify-end gap-1.5">
          <span className="text-2xl sm:text-3xl font-lexend font-extrabold text-slate-800">
            {formattedScore}%
          </span>
          <span className="text-xs font-medium text-slate-500">Threat Risk</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-4 rounded-full bg-[#edf3f7] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] overflow-hidden p-0.5">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.max(safeScore, 4)}%`,
            backgroundColor: barColor,
          }}
        ></div>
      </div>

      {/* Matched Indian Scam Pattern Badge */}
      {matchedPatternId && (
        <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-red-50/80 border border-red-200/80 p-3 text-xs sm:text-sm text-red-900">
          <span className="font-bold text-red-700 whitespace-nowrap">🚨 Scam Pattern Match:</span>
          <span>
            <strong>{matchedPatternId}</strong>
            {matchedPatternDetails?.title ? ` — ${matchedPatternDetails.title}` : ""}
          </span>
        </div>
      )}
    </div>
  );
};

export default RiskScore;
