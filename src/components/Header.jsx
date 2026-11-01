import React from "react";
import logo from "../assets/logo.jpeg";
const Header = () => {
  return (
    <>
      <div className="titleContainer bg-card flex w-full max-w-5xl flex-col items-center justify-between gap-3 rounded-full border border-border p-4 shadow-lg sm:flex-row sm:p-5">
        {/* LOGO */}
        <div className="title-container flex items-center gap-2">
          <span className="logo">
            <img
              src={logo}
              alt="PhishGuard Logo"
              className="h-11 w-11 rounded-full"
            />
          </span>
          <h1 className="title text-2xl font-bold text-primary sm:text-3xl">
            PhishGuard
          </h1>
        </div>

        <button className="search-button flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-emerald-800 active:scale-95">
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
