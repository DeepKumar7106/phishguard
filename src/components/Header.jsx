import React from "react";

const Header = () => {
  return (
    <>
      <div className="titleContainer bg-card flex justify-between items-center w-8/12 p-5 border border-border rounded-full shadow-lg">
        {/* LOGO */}
        <div className="title-container">
          <span className="logo">
            <img src="" alt="" />
          </span>
          <h1 className="title font-bold text-3xl text-primary">PhishGuard</h1>
        </div>

        <button className="search-button flex gap-2 justify-between items-center bg-scam px-3 py-2 rounded-full text-white hover:bg-scam/80 transition duration-300 ease-in-out active:scale-95">
          <span className="fas fa-search text-md"></span>
          <span className="text-xl font-bold">Search</span>
        </button>
      </div>
    </>
  );
};

export default Header;
