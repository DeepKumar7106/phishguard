import React, { useState } from "react";

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
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "scam"
        ? item.isScam || item.riskLevel === "High"
        : item.riskLevel === "Low" || item.authenticityScore >= 70;

    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.target?.toLowerCase().includes(query) ||
      item.contentSnippet?.toLowerCase().includes(query) ||
      item.explanation?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl bg-[#ebf1f4] shadow-[0_20px_60px_rgba(15,23,42,0.35)] border border-white/60 font-lexend overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/40 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <span className="text-xl">🕒</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 sm:text-2xl flex items-center gap-2">
                Scan History
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {history.length} {history.length === 1 ? "record" : "records"}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Past scam site checks, authenticity scores, and threat breakdowns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAllHistory}
                className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition"
                title="Clear all saved history"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 font-bold transition"
              title="Close history"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white/20 border-b border-slate-200/60">
          {/* Search box */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by site domain, URL, or keywords..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === "all"
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("scam")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === "scam"
                  ? "bg-red-600 text-white"
                  : "bg-white text-red-700 hover:bg-red-50 border border-red-200"
              }`}
            >
              🔴 Scams (
              {
                history.filter(
                  (i) => i.isScam || i.riskLevel === "High"
                ).length
              }
              )
            </button>
            <button
              type="button"
              onClick={() => setFilter("safe")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === "safe"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
              }`}
            >
              🟢 Authentic (
              {
                history.filter(
                  (i) => i.riskLevel === "Low" || i.authenticityScore >= 70
                ).length
              }
              )
            </button>
          </div>
        </div>

        {/* History List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <span className="text-4xl mb-3">🛡️</span>
              <p className="text-base font-semibold text-slate-600">
                {history.length === 0
                  ? "No scan history recorded yet."
                  : "No matching history found for current filter."}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {history.length === 0
                  ? "Every time you scan a website, email, offer letter, or screenshot, the authenticity analysis will be remembered here."
                  : "Try clearing your search query or selecting 'All'."}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isHighScam = item.isScam || item.riskLevel === "High";
              const isModerate = item.riskLevel === "Medium";
              const isLowRisk = item.riskLevel === "Low";

              return (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col gap-3"
                >
                  {/* Top Row: Target & Verdict Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xl">
                        {item.inputType === "image"
                          ? "📷"
                          : item.target?.includes(".")
                          ? "🌐"
                          : "📄"}
                      </span>
                      <div className="truncate">
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                          {item.target || "Scanned Content"}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.timestamp).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Authenticity & Scam Verdict Pills */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {/* Authenticity Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          item.authenticityScore >= 75
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : item.authenticityScore >= 40
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : "bg-red-50 text-red-800 border-red-300"
                        }`}
                      >
                        <span className="font-bold">
                          {item.authenticityScore}%
                        </span>{" "}
                        Authentic
                      </span>

                      {/* Scam / Safety Verdict Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          isHighScam
                            ? "bg-red-100 text-red-800 border-red-300 animate-pulse"
                            : isModerate
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-emerald-100 text-emerald-900 border-emerald-300"
                        }`}
                      >
                        {isHighScam
                          ? "🚨 SCAM"
                          : isModerate
                          ? "⚠️ SUSPICIOUS"
                          : "✅ SAFE"}
                      </span>
                    </div>
                  </div>

                  {/* Summary / Explanation */}
                  <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {item.explanation || item.contentSnippet}
                  </p>

                  {/* Red flags snippet if present */}
                  {item.redFlags && item.redFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {item.redFlags.slice(0, 3).map((rf, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200"
                        >
                          • {rf}
                        </span>
                      ))}
                      {item.redFlags.length > 3 && (
                        <span className="text-slate-400 self-center">
                          +{item.redFlags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 capitalize">
                      Input Type: {item.inputType || "text"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectHistoryItem(item.rawResult);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95"
                      >
                        <span>👁️</span> Load Full Report
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition"
                        title="Delete from history"
                      >
                        🗑️
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
