import React, { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import UserInput from "./components/UserInput";
import DisplayContainer from "./components/DisplayContainer";
import { analyzeThreat } from "./api";

function App() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = async ({ content, file }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeThreat({ content, file });
      setScanResult(result);

      // Scroll smoothly to results
      setTimeout(() => {
        window.scrollBy({
          top: 350,
          behavior: "smooth",
        });
      }, 150);
    } catch (err) {
      console.error("[app] Threat analysis error:", err);
      setError(err.message || "Failed to analyze threat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearError = () => {
    setError(null);
  };

  return (
    <div className="App page-shell bg-background flex min-h-screen w-full flex-col items-center gap-y-6 p-3 sm:p-5 font-lexend">
      <div className="reveal-section section-delay-1 w-full flex justify-center">
        <Header />
      </div>

      <div className="reveal-section section-delay-2 w-full flex justify-center">
        <UserInput onScan={handleScan} loading={loading} />
      </div>

      <div className="reveal-section section-delay-3 w-full flex justify-center">
        <DisplayContainer
          scanResult={scanResult}
          loading={loading}
          error={error}
          onClearError={handleClearError}
        />
      </div>
    </div>
  );
}

export default App;
