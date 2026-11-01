import React from "react";

const ScanSummary = ({
  summary = "",
  redFlags = [],
  dpdpCompliance = null,
  statutoryIdentifiers = null,
  metadataChecks = null,
  imageMetadata = null,
}) => {
  const flags = Array.isArray(redFlags) ? redFlags : [];
  const isDayZero =
    metadataChecks?.domains?.[0]?.isDayZero ||
    metadataChecks?.flags?.some((f) => f.code === "DAY_ZERO_DOMAIN") ||
    flags.some((f) => f.toLowerCase().includes("registered today") || f.toLowerCase().includes("newly registered entity"));
  const hasStatutory = statutoryIdentifiers?.hasStatutoryProof;

  return (
    <div className="w-full rounded-2xl bg-[#ebf1f4] p-5 shadow-[6px_6px_14px_rgba(163,177,198,0.2),-6px_-6px_14px_rgba(255,255,255,0.9)] border border-white/40 font-lexend">
      <h2 className="text-xl font-bold text-slate-800 mb-2.5 flex items-center gap-2">
        <span>🔍</span> Detailed Scan Summary
      </h2>

      {/* Explanation text */}
      <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-4 bg-white/50 p-3.5 rounded-xl border border-white/60">
        {summary || "No threat details recorded yet. Enter text or upload a screenshot above to scan."}
      </p>

      {/* Day-0 Startup Official Verification Panel */}
      {(isDayZero || hasStatutory) && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-sm mb-1.5">
            <span className="text-base">🏛️</span>
            <span>Day-0 Startup & Statutory Verification Guide</span>
          </div>
          <p className="text-xs text-amber-900 mb-3 leading-relaxed">
            This entity or domain was registered very recently. Legitimate ventures in India must be registered under the Ministry of Corporate Affairs (MCA) or Startup India. Use official government portals below to verify before proceeding:
          </p>

          {statutoryIdentifiers?.cins?.length > 0 && (
            <div className="mb-3 text-xs text-slate-800 flex items-center flex-wrap gap-1.5">
              <span className="font-semibold">Detected Corporate ID (CIN):</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 font-bold text-amber-900">
                {statutoryIdentifiers.cins.join(", ")}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-xs">
            <a
              href="https://www.mca.gov.in/content/mca/global/en/mca/master-data/MDS.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-medium text-slate-800 shadow-sm border border-slate-300 hover:bg-slate-100 transition"
            >
              <span>🔗</span> Verify on MCA Master Data Portal
            </a>
            <a
              href="https://www.startupindia.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-medium text-slate-800 shadow-sm border border-slate-300 hover:bg-slate-100 transition"
            >
              <span>🇮🇳</span> Startup India Directory (DPIIT)
            </a>
          </div>
        </div>
      )}

      {/* Red Flags List */}
      {flags.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-red-700 mb-2">
            Identified Risk Factors ({flags.length}):
          </h3>
          <ul className="space-y-1.5">
            {flags.map((flag, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 bg-red-50/70 border border-red-200/60 rounded-lg px-3 py-1.5"
              >
                <span className="text-red-500 font-bold">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Badges / Metadata Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/70 text-xs">
        {/* DPDP Act Compliance Badge */}
        {dpdpCompliance && (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-800 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium">
              {dpdpCompliance.status || "DPDP Compliant"}
            </span>
            {dpdpCompliance.totalPiiRedacted > 0 && (
              <span className="bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded text-[10px]">
                {dpdpCompliance.totalPiiRedacted} PII Masked
              </span>
            )}
          </div>
        )}

        {/* Image OCR Badge */}
        {imageMetadata && (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-blue-800 border border-blue-200">
            <span>📷</span>
            <span className="font-medium truncate max-w-[180px]">
              {imageMetadata.filename || "Screenshot analyzed"}
            </span>
          </div>
        )}

        {/* Domain Checks Badge */}
        {metadataChecks?.domains?.[0] && (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 border border-slate-200">
            <span>🌐</span>
            <span className="font-medium">
              {metadataChecks.domains[0].domain}
            </span>
            {metadataChecks.domains[0].ageInDays !== undefined && (
              <span className="text-slate-500">
                ({metadataChecks.domains[0].ageInDays} days old)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanSummary;
