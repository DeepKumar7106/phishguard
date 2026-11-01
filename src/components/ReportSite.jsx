import React, { useState, useRef } from "react";
import ReportComponent from "./ReportComponent";

const ReportSite = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const handleClick = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState) {
      setTimeout(() => {
        window.scrollBy({
          top: 500,
          behavior: "smooth",
        });
      }, 80);
    }
  };

  return (
    <div className="report-site-shell">
      <div className="report-site-container bg-card3 p-6 rounded-lg mt-4 shadow-sm flex flex-col items-center justify-center gap-y-2">
        <h3 className="report-site-header text-2xl text-amber-50 font-semibold font-lexend w-full text-center">
          Report a Scam Site:
        </h3>
        <p className="report-site-content text-gray-100 font-poppins w-full text-center">
          If you have encountered a scam site, please report it to help protect
          others. You can submit the URL of the scam site along with any
          relevant details.
        </p>

        <button
          type="button"
          onClick={handleClick}
          aria-expanded={isOpen}
          className="report-site-button font-lexend text-sm mt-3 px-4 py-2 bg-blue-900 text-white font-semibold rounded-full hover:bg-blue-800 transition-all flex items-center justify-center active:scale-95"
        >
          Report Scam Site
        </button>

        {isOpen && (
          <div ref={panelRef} className="report-site-panel-reveal w-full">
            <ReportComponent />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportSite;
