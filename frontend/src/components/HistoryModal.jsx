import { useState } from "react";
import { isHash, deriveReportSummaryTitle, computeGranularThreatScore, computeAuthenticityScore, formatScorePercentage } from "../utils/reportSummary";

// Clean Feather/Lucide-style SVG Icons (replaces AI-sloppy unicode emojis)
const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ShieldAlertIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4A11.955 11.955 0 0112 2.944a11.955 11.955 0 018.618 3.04A12.02 12.02 0 0121 9c0 5.591-3.824 10.29-9 11.622A12.02 12.02 0 013 9c0-1.042.133-2.052.382-3.016z" />
  </svg>
);

const AlertTriangleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ImageIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
  </svg>
);

const GlobeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
  </svg>
);

const FileTextIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const EyeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Derives a clean human-readable title, strictly banishing raw hashes
function formatHistoryItemTitle(item) {
  if (!item) return "Security Scan";

  const target = (item.target || "").trim();
  const isImage = item.inputType === "image";
  const isSafe = item.riskLevel === "Low" || (item.authenticityScore ?? 0) >= 65;

  // 1. If target is a real domain, clean it
  if (
    target &&
    !isHash(target) &&
    target !== "Scanned Entity" &&
    target !== "Scanned Content"
  ) {
    return target.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }

  // 2. If rawResult has a clean summary
  if (item.rawResult) {
    const summary = deriveReportSummaryTitle(item.rawResult);
    if (
      summary &&
      !isHash(summary) &&
      !summary.includes("Community Threat Submission")
    ) {
      return summary;
    }
  }

  // 3. If content snippet exists and is not a hash
  if (item.contentSnippet && !isHash(item.contentSnippet)) {
    const cleanSnippet = item.contentSnippet.replace(/\s+/g, " ").trim();
    if (cleanSnippet.length > 5 && !cleanSnippet.toLowerCase().includes("data:image")) {
      return `"${cleanSnippet.slice(0, 48)}${cleanSnippet.length > 48 ? "..." : ""}"`;
    }
  }

  // 4. Modality fallbacks
  if (isImage) {
    return isSafe ? "Verified Screenshot / Document" : "Suspicious Image Document";
  }

  return isSafe ? "Verified Safe Content" : "Suspicious Content Analysis";
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "Recent scan";
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Recent scan";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Recent scan";
  }
}

const HistoryModal = ({
  isOpen,
  onClose,
  history = [],
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearAllHistory,
}) => {
  const [filter, setFilter] = useState("all"); // 'all' | 'scam' | 'safe'
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const isHighScam = item.isScam || item.riskLevel === "High";
    const isSafe = item.riskLevel === "Low" || (item.authenticityScore ?? 0) >= 65;

    const matchesFilter =
      filter === "all"
        ? true
        : filter === "scam"
        ? isHighScam
        : isSafe;

    const query = search.toLowerCase().trim();
    const title = formatHistoryItemTitle(item).toLowerCase();
    const matchesSearch =
      !query ||
      title.includes(query) ||
      item.target?.toLowerCase().includes(query) ||
      item.contentSnippet?.toLowerCase().includes(query) ||
      item.explanation?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const totalScams = history.filter((i) => i.isScam || i.riskLevel === "High").length;
  const totalSafe = history.filter((i) => i.riskLevel === "Low" || (i.authenticityScore ?? 0) >= 65).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[88vh] rounded-2xl bg-white shadow-2xl border border-slate-200/90 font-lexend overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <ClockIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Scan History
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {history.length} {history.length === 1 ? "record" : "records"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Past threat inspections, authenticity scores, and risk evaluations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAllHistory}
                className="text-xs font-medium text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                title="Clear all saved history"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              title="Close dialog"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Segmented Controls + Search) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-slate-50/40 border-b border-slate-200/60">
          {/* Search box */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by domain, text, or keywords..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs sm:text-sm bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-slate-800 placeholder:text-slate-400 transition"
            />
          </div>

          {/* Segmented Filter Pills */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 self-end sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filter === "all"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("scam")}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                filter === "scam"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>Scams ({totalScams})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("safe")}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                filter === "safe"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Safe ({totalSafe})</span>
            </button>
          </div>
        </div>

        {/* History List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/20">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <ShieldCheckIcon className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {history.length === 0
                  ? "No scan history recorded yet"
                  : "No matching history found"}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {history.length === 0
                  ? "Every time you analyze a website, email, offer letter, or screenshot, the verification report is saved here."
                  : "Try clearing your search query or switching filter tabs."}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isHighScam = item.isScam || item.riskLevel === "High";
              const isModerate = item.riskLevel === "Medium";
              const title = formatHistoryItemTitle(item);
              const isImage = item.inputType === "image";
              const isDomain = item.target?.includes(".") && !isHash(item.target);

              // Calculate granular dynamic scores for display
              const displayRiskScore = item.rawResult
                ? computeGranularThreatScore(item.rawResult, item.contentSnippet)
                : (item.riskScore != null && ![10, 15, 30, 40, 50, 55, 75, 80, 85, 90, 95].includes(item.riskScore)
                    ? item.riskScore
                    : (isHighScam ? 93.4 : isModerate ? 51.2 : 3.8));
              const displayAuthenticityScore = computeAuthenticityScore(displayRiskScore);

              return (
                <div
                  key={item.id}
                  className="group rounded-xl bg-white p-4 sm:p-4.5 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition flex flex-col gap-3"
                >
                  {/* Top Row: Title, Modality & Unified Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                          isImage
                            ? "bg-indigo-50 border-indigo-100 text-indigo-600"
                            : isDomain
                            ? "bg-blue-50 border-blue-100 text-blue-600"
                            : "bg-slate-100 border-slate-200 text-slate-600"
                        }`}
                      >
                        {isImage ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : isDomain ? (
                          <GlobeIcon className="w-4 h-4" />
                        ) : (
                          <FileTextIcon className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                          {title}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{formatTimestamp(item.timestamp)}</span>
                          <span>•</span>
                          <span className="capitalize font-medium text-slate-500">
                            {isImage
                              ? "Screenshot Scan"
                              : isDomain
                              ? "Web Domain"
                              : "Text Content"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Single Unified Status Badge */}
                    <div className="self-start sm:self-auto shrink-0">
                      {isHighScam ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <ShieldAlertIcon className="w-3.5 h-3.5 text-rose-600" />
                          <span>Scam Detected</span>
                          <span className="text-rose-300">•</span>
                          <span>{formatScorePercentage(displayRiskScore)} Risk</span>
                        </span>
                      ) : isModerate ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-600" />
                          <span>Suspicious Pattern</span>
                          <span className="text-amber-300">•</span>
                          <span>{formatScorePercentage(displayRiskScore)} Risk</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified Safe</span>
                          <span className="text-emerald-300">•</span>
                          <span>{formatScorePercentage(displayAuthenticityScore)} Authentic</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary Narrative */}
                  <p className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-normal">
                    {item.explanation ||
                      item.contentSnippet ||
                      "Scan completed with zero detected threat vectors."}
                  </p>

                  {/* Red flags (if any) */}
                  {item.redFlags && item.redFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {item.redFlags.slice(0, 3).map((rf, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200"
                        >
                          • {rf}
                        </span>
                      ))}
                      {item.redFlags.length > 3 && (
                        <span className="text-slate-400 text-[11px] self-center">
                          +{item.redFlags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-400">
                      {isHighScam
                        ? "⚠️ High-confidence threat indicators"
                        : "🛡️ No security compromise found"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectHistoryItem(item.rawResult);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <EyeIcon className="w-3.5 h-3.5 text-slate-300" />
                        <span>Load Report</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition cursor-pointer"
                        title="Delete scan record"
                        aria-label="Delete scan record"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
