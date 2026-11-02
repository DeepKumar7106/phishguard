
const Suggestion = ({ suggestion }) => {
  const guidanceList = Array.isArray(suggestion)
    ? suggestion
    : typeof suggestion === "string" && suggestion.includes("\n")
      ? suggestion.split("\n").filter(Boolean)
      : typeof suggestion === "string" && suggestion.trim()
        ? [suggestion]
        : [];

  return (
    <div className="w-full rounded-2xl bg-[#ebf1f4] p-5 shadow-[6px_6px_14px_rgba(163,177,198,0.2),-6px_-6px_14px_rgba(255,255,255,0.9)] border border-white/40 font-lexend">
      <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
        <span>🛡️</span> Recommended Safety Actions:
      </h3>

      {guidanceList.length > 0 ? (
        <div className="space-y-2">
          {guidanceList.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-white/60 p-3 rounded-xl border border-white/80 text-sm sm:text-base text-slate-700 font-poppins"
            >
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                {idx + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-600 font-poppins text-sm bg-white/50 p-3 rounded-xl">
          Standard precaution: Never share banking OTPs, PINs, or pay advance security deposits for employment.
        </p>
      )}
    </div>
  );
};

export default Suggestion;
