import React, { useState, useRef } from "react";
import ReportComponent from "./ReportComponent";

const ReportSite = ({ defaultTarget = "", onReported = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const handleClick = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState) {
      setTimeout(() => {
        window.scrollBy({
          top: 350,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  return (
    <div className="report-site-shell w-full font-lexend">
      <div className="report-site-container bg-[#ebf1f4] p-5 sm:p-6 rounded-2xl border border-white/40 shadow-[6px_6px_14px_rgba(163,177,198,0.2),-6px_-6px_14px_rgba(255,255,255,0.9)] flex flex-col items-center justify-center gap-y-2">
        <h3 className="report-site-header text-xl sm:text-2xl text-slate-800 font-bold w-full text-center flex items-center justify-center gap-2">
          <span>📢</span> Report a Scam Site or Recruiter:
        </h3>
        <p className="report-site-content text-slate-600 font-poppins text-xs sm:text-sm w-full text-center max-w-2xl">
          If you have encountered a suspicious job posting, fake internship letter, or phishing link, report it to expand the PhishGuard community threat intelligence network.
        </p>

        <button
          type="button"
          onClick={handleClick}
          aria-expanded={isOpen}
          className="report-site-button text-sm mt-3 px-6 py-2.5 bg-blue-900 text-white font-semibold rounded-full hover:bg-blue-800 transition-all flex items-center justify-center active:scale-95 shadow-md"
        >
          {isOpen ? "Hide Report Form ▲" : "Report This Scam ▼"}
        </button>

        {isOpen && (
          <div ref={panelRef} className="report-site-panel-reveal w-full animate-fadeIn">
            <ReportComponent defaultTarget={defaultTarget} onReported={onReported} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportSite;
