import React from "react";
import RiskScore from "./RiskScore";
import ScanSummary from "./ScanSummary";
import Graph from "./Graph";
import Suggestion from "./Suggestion";
import ReportSite from "./ReportSite";
import ErrorModal from "./ErrorModal";
import LoadAnimation1 from "./load-animations/LoadAnimation1";
import { deriveReportSummaryTitle } from "../utils/reportSummary";

const DisplayContainer = ({ scanResult, loading, error, onClearError, onReported }) => {
  if (loading) {
    return (
      <div className="container mt-6 flex w-full max-w-5xl flex-col items-center justify-center gap-y-4 p-8 bg-[#ebf1f4] rounded-3xl border border-white/40 shadow-sm animate-fadeIn">
        <LoadAnimation1 />
        <p className="text-base font-lexend font-semibold text-slate-700 animate-pulse mt-2">
          Inspecting threat vectors, checking domain age & sanitizing PII...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-6 flex w-full max-w-5xl flex-col items-center justify-center p-4">
        <ErrorModal errorMessage={error} onClose={onClearError} />
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="container mt-6 flex w-full max-w-5xl flex-col items-center justify-center gap-y-3 p-8 bg-[#ebf1f4]/60 rounded-3xl border border-dashed border-slate-300 text-center text-slate-500 font-lexend">
        <div className="text-3xl">🛡️</div>
        <h3 className="text-lg font-semibold text-slate-700">Ready to Analyze</h3>
        <p className="text-sm max-w-md text-slate-500">
          Paste a WhatsApp message, recruiter email, suspicious job offer, or upload a screenshot above to run deep multi-layer threat detection.
        </p>
      </div>
    );
  }

  const verdict = scanResult.verdict || {};
  const score = verdict.score ?? (verdict.risk_level === "High" ? 85 : verdict.risk_level === "Medium" ? 50 : 10);
  const riskLevel = verdict.risk_level || "Low";
  const matchedPatternId = verdict.matched_pattern_id;
  const matchedPatternDetails = verdict.matched_pattern_details;
  const summary = verdict.explanation || "Scan completed successfully.";
  const redFlags = verdict.red_flags || [];
  const actionableGuidance = verdict.actionable_guidance || [];

  // Historical graph query target (domain or contentHash)
  const graphTarget =
    scanResult.metadataChecks?.domains?.[0]?.domain ||
    scanResult.input?.contentHash ||
    scanResult.input?.target ||
    "";

  // Formatted summary title for the report submission
  const reportSummaryTitle = deriveReportSummaryTitle(scanResult);

  return (
    <div className="container mt-4 flex w-full max-w-5xl flex-col items-start justify-center gap-y-6 p-0 sm:p-2 animate-fadeIn">
      {/* 1. Threat Score Progress Bar */}
      <RiskScore
        score={score}
        riskLevel={riskLevel}
        matchedPatternId={matchedPatternId}
        matchedPatternDetails={matchedPatternDetails}
      />

      {/* 2. Detailed Scan Summary, Red Flags & DPDP Compliance */}
      <ScanSummary
        summary={summary}
        redFlags={redFlags}
        dpdpCompliance={scanResult.dpdpCompliance}
        statutoryIdentifiers={scanResult.statutoryIdentifiers}
        metadataChecks={scanResult.metadataChecks}
        imageMetadata={scanResult.imageMetadata}
      />

      {/* 3. Historical Threat Trend Graph */}
      {graphTarget && <Graph searchQuery={graphTarget} />}

      {/* 4. Actionable Future Guidance */}
      <Suggestion suggestion={actionableGuidance} />

      {/* 5. Community Threat Report Portal with Auto-Summarized Title */}
      <ReportSite
        defaultTitle={reportSummaryTitle}
        defaultTarget={graphTarget}
        scanResult={scanResult}
        onReported={onReported}
      />
    </div>
  );
};

export default DisplayContainer;
