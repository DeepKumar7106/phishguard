import React from "react";
import logo from "../assets/logo.jpeg";
const Header = () => {
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

        <button className="search-button flex items-center justify-center gap-2 rounded-full bg-emerald-700/90 px-4 py-2 text-white shadow-md transition duration-300 ease-in-out hover:bg-emerald-800 active:scale-95">
          <span className="fa fa-history text-md"></span>
          <span className="text-lg font-lexend font-semibold sm:text-xl">
            History
          </span>
        </button>
      </div>
    </>
  );
};

export default Header;
