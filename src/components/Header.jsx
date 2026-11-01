import React from "react";
import logo from "../assets/logo.jpeg";
const Header = () => {
  return (
    <>
      <div className="titleContainer bg-card flex justify-between items-center w-8/12 p-5 border border-border rounded-full shadow-lg">
        {/* LOGO */}
        <div className="title-container flex items-center gap-2">
          <span className="logo">
            <img src={logo} alt="PhishGuard Logo"  className="w-11 h-11 rounded-full"/>
          </span>
          <h1 className="title font-bold text-3xl text-primary">PhishGuard</h1>
        </div>

        <button className="search-button flex gap-2 justify-between items-center bg-emerald-700 px-4 py-2 rounded-full text-white hover:bg-emerald-800  transition duration-300 ease-in-out active:scale-95">
          <span className="fa fa-history text-md"></span>
          <span className="text-xl font-lexend font-semibold">History</span>
        </button>
      </div>
    </>
  );
};

export default Header;
