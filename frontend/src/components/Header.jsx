import React from "react";
import logo from "../assets/logo.jpeg";

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

const Header = ({ onOpenHistory, historyCount = 0 }) => {
  return (
    <>
      <div className="titleContainer flex w-full max-w-5xl flex-col items-center justify-between gap-3 rounded-full border border-white/30 bg-white/20 p-4 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl backdrop-saturate-150 sm:flex-row sm:p-5">
        {/* LOGO */}
        <div className="title-container flex items-center gap-2">
          <span className="logo">
            <img
              src={logo}
              alt="PhishGuard Logo"
              className="h-11 w-11 rounded-full border border-white/40 shadow-sm"
            />
          </span>
          <h1 className="title text-2xl font-bold text-slate-800 sm:text-3xl">
            PhishGuard
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenHistory}
          className="search-button group relative flex items-center justify-center gap-2 rounded-full bg-emerald-700/90 hover:bg-emerald-800 px-5 py-2.5 text-white shadow-md transition duration-300 ease-in-out active:scale-95 cursor-pointer"
          title="View scam search history"
        >
          <ClockIcon className="w-5 h-5 text-emerald-100 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-base font-lexend font-semibold sm:text-lg">
            History
          </span>
          {historyCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-white text-emerald-800 text-xs font-bold px-2 py-0.5 shadow-sm">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default Header;
