import { useState } from "react";
import { submitScamReport } from "../api";
import {
  deriveReportSummaryTitle,
  deriveReportDescription,
  isHash,
} from "../utils/reportSummary";

const ReportComponent = ({
  defaultTitle = "",
  defaultTarget = "",
  scanResult = null,
  onReported = null,
}) => {
  // Compute initial summarized title from scanResult or props
  const computeInitialTitle = () => {
    if (defaultTitle && !isHash(defaultTitle)) {
      return defaultTitle;
    }
    if (scanResult) {
      return deriveReportSummaryTitle(scanResult, defaultTarget);
    }
    if (defaultTarget && !isHash(defaultTarget)) {
      return `[Scam Report] ${defaultTarget.trim()}`;
    }
    return "";
  };

  // Compute initial contact / domain
  const computeInitialContact = () => {
    const domain =
      scanResult?.metadataChecks?.domains?.find((d) => !d.isIp)?.domain ||
      scanResult?.metadataChecks?.domains?.[0]?.domain;
    if (domain) return domain;

    if (
      defaultTarget &&
      !isHash(defaultTarget) &&
      (defaultTarget.includes(".") ||
        defaultTarget.includes("@") ||
        /^\+?\d/.test(defaultTarget))
    ) {
      return defaultTarget;
    }
    return "";
  };

  const [targetEndpoint, setTargetEndpoint] = useState(computeInitialTitle);
  const [contactEndpoint, setContactEndpoint] = useState(computeInitialContact);
  const [description, setDescription] = useState(() =>
    scanResult ? deriveReportDescription(scanResult) : ""
  );
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetEndpoint.trim()) {
      setErrorMessage("Please enter the title or summary of the scam report.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const detectedDomain =
        scanResult?.metadataChecks?.domains?.find((d) => !d.isIp)?.domain ||
        scanResult?.metadataChecks?.domains?.[0]?.domain ||
        (contactEndpoint &&
        contactEndpoint.includes(".") &&
        !contactEndpoint.includes("@") &&
        !contactEndpoint.includes(" ")
          ? contactEndpoint.trim()
          : null);

      let fullDescription = description.trim();
      if (contactEndpoint && contactEndpoint.trim()) {
        fullDescription = fullDescription
          ? `${fullDescription}\n\nReported Contact / URL: ${contactEndpoint.trim()}`
          : `Reported Contact / URL: ${contactEndpoint.trim()}`;
      }

      const result = await submitScamReport({
        targetEndpoint: targetEndpoint.trim(),
        domain: detectedDomain,
        description: fullDescription,
        inputType: scanResult?.input?.inputType || "text",
      });

      setSuccessMessage(
        "Report successfully recorded! Thank you for helping protect students!"
      );
      if (onReported) {
        onReported(result);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit scam report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-component-container bg-white/70 backdrop-blur-sm p-6 rounded-2xl mt-4 border border-white/80 shadow-md font-lexend">
      <h3 className="text-xl text-slate-800 font-bold mb-2 text-center">
        Submit a Community Threat Report
      </h3>
      <p className="text-slate-600 font-poppins text-xs sm:text-sm text-center mb-4">
        Crowdsourced threat submissions protect other students across India from active recruitment scams and phishing campaigns.
      </p>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-medium animate-fadeIn text-center">
          ✅ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded-xl text-sm font-medium animate-fadeIn text-center">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Field 1: Report Title / Summarized Format of Issue Submitted */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              className="text-slate-700 text-xs sm:text-sm font-semibold block"
              htmlFor="scamTitle"
            >
              Report Title (Summarized Issue Format):
            </label>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              Auto-summarized
            </span>
          </div>
          <input
            type="text"
            id="scamTitle"
            value={targetEndpoint}
            onChange={(e) => setTargetEndpoint(e.target.value)}
            disabled={loading}
            className="w-full bg-[#edf3f7] px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-medium"
            placeholder="e.g. [High Risk Scam] Fake Job Offer - Laptop Security Deposit Scheme"
            required
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Summarized format of the issue submitted. You can edit this before submitting to the community threat network.
          </p>
        </div>

        {/* Field 2: Optional Contact / URL / Recruiter Handle */}
        <div>
          <label
            className="text-slate-700 text-xs sm:text-sm font-semibold block mb-1"
            htmlFor="scamContact"
          >
            Suspicious URL, Recruiter Email, or Phone (Optional):
          </label>
          <input
            type="text"
            id="scamContact"
            value={contactEndpoint}
            onChange={(e) => setContactEndpoint(e.target.value)}
            disabled={loading}
            className="w-full bg-[#edf3f7] px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            placeholder="e.g. fake-infosys-jobs.xyz, recruiter@gmail.com, or +91 9876543210"
          />
        </div>

        {/* Field 3: Deceptive Request / Financial Trap Details */}
        <div>
          <label
            className="text-slate-700 text-xs sm:text-sm font-semibold block mb-1"
            htmlFor="issueDescription"
          >
            Describe The Financial Trap or Deceptive Request (Optional):
          </label>
          <textarea
            id="issueDescription"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            className="w-full bg-[#edf3f7] px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition resize-none"
            placeholder="e.g. Demanded ₹5000 refundable laptop deposit via UPI; forced to join VIP Telegram group."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading || !targetEndpoint.trim()}
          className="mt-2 px-6 py-2.5 bg-blue-900 text-white font-semibold rounded-full hover:bg-blue-800 transition-all flex items-center justify-center active:scale-95 mx-auto disabled:opacity-50 text-sm shadow-md"
        >
          {loading ? "Recording Report..." : "Submit Scam Report"}
        </button>
      </form>
    </div>
  );
};

export default ReportComponent;
