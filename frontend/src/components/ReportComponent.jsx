import React, { useState, useEffect } from "react";
import { submitScamReport } from "../api";

const ReportComponent = ({ defaultTarget = "", onReported = null }) => {
  const [targetEndpoint, setTargetEndpoint] = useState(defaultTarget || "");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (defaultTarget) {
      setTargetEndpoint(defaultTarget);
    }
  }, [defaultTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetEndpoint.trim()) {
      setErrorMessage("Please enter the scam URL or email address.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await submitScamReport({
        targetEndpoint: targetEndpoint.trim(),
        description: description.trim(),
      });

      setSuccessMessage(
        `Report successfully recorded! (Report ID: ${result.reportId || "Queued"}). Thank you for helping protect students!`
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
        <div>
          <label
            className="text-slate-700 text-xs sm:text-sm font-semibold block mb-1"
            htmlFor="scamUrl"
          >
            Suspicious URL, Recruiter Email, or Phone Number:
          </label>
          <input
            type="text"
            id="scamUrl"
            value={targetEndpoint}
            onChange={(e) => setTargetEndpoint(e.target.value)}
            disabled={loading}
            className="w-full bg-[#edf3f7] px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            placeholder="e.g. fake-infosys-jobs.xyz, recruiter@gmail.com, or +91 9876543210"
            required
          />
        </div>

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
          className="mt-2 px-6 py-2.5 bg-blue-900 text-white font-semibold rounded-full hover:bg-blue-800 transition-all flex items-center justify-center active:scale-95 mx-auto disabled:opacity-50 text-sm"
        >
          {loading ? "Recording Report..." : "Submit Scam Report"}
        </button>
      </form>
    </div>
  );
};

export default ReportComponent;
