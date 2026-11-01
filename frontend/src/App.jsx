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
    <div className="App bg-background flex min-h-screen w-full flex-col items-center gap-y-6 p-3 sm:p-5 font-lexend">
      <Header />
      <UserInput onScan={handleScan} loading={loading} />
      <DisplayContainer
        scanResult={scanResult}
        loading={loading}
        error={error}
        onClearError={handleClearError}
      />
    </div>
  );
}

export default App;
