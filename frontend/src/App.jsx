import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import UserInput from "./components/UserInput";
import DisplayContainer from "./components/DisplayContainer";
import HistoryModal from "./components/HistoryModal";
import { analyzeThreat } from "./api";
import { deriveReportSummaryTitle, isHash, computeGranularThreatScore, computeAuthenticityScore } from "./utils/reportSummary";

const STORAGE_KEY_LAST_SCAN = "phishguard_last_scan";
const STORAGE_KEY_HISTORY = "phishguard_scan_history";

function App() {
  // Load persisted scan result on initial render so page refresh preserves response
  const [scanResult, setScanResult] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAST_SCAN);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Load user scan history from localStorage
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sync scanResult to localStorage whenever it changes
  useEffect(() => {
    try {
      if (scanResult) {
        localStorage.setItem(STORAGE_KEY_LAST_SCAN, JSON.stringify(scanResult));
      } else {
        localStorage.removeItem(STORAGE_KEY_LAST_SCAN);
      }
    } catch (e) {
      console.warn("[app] Could not persist scan to localStorage:", e);
    }
  }, [scanResult]);

  // Sync history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn("[app] Could not persist history to localStorage:", e);
    }
  }, [history]);

  const handleScan = async ({ content, file }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeThreat({ content, file });
      setScanResult(result);

      // Save to scan history with authenticity and site details (prevent raw SHA-256 hashes)
      const detectedDomain = result.metadataChecks?.domains?.[0]?.domain;
      const targetName =
        detectedDomain ||
        (!isHash(result.input?.target) ? result.input?.target : null) ||
        deriveReportSummaryTitle(result) ||
        (content ? content.slice(0, 50).trim() : file?.name || "Scanned Entity");

      const riskLevel = result.verdict?.risk_level || "Unknown";
      const score = computeGranularThreatScore(result, content);
      const authenticityScore = computeAuthenticityScore(score);

      const historyRecord = {
        id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        target: targetName,
        inputType: result.input?.inputType || (file ? "image" : "text"),
        contentSnippet: content ? content.slice(0, 160).trim() : file?.name || "",
        riskLevel,
        riskScore: score,
        authenticityScore,
        isScam: riskLevel === "High",
        explanation: result.verdict?.explanation || "Threat scan completed.",
        redFlags: result.verdict?.red_flags || [],
        rawResult: result,
      };

      setHistory((prev) => [historyRecord, ...prev.filter((item) => item.target !== targetName)].slice(0, 50));

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

  // Clear current active scan results
  const handleClearResult = () => {
    setScanResult(null);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY_LAST_SCAN);
    } catch {}
  };

  const handleClearError = () => {
    setError(null);
  };

  // History Actions
  const handleSelectHistoryItem = (rawResult) => {
    setScanResult(rawResult);
    setTimeout(() => {
      window.scrollBy({
        top: 350,
        behavior: "smooth",
      });
    }, 150);
  };

  const handleDeleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch {}
  };

  return (
    <div className="App page-shell bg-background flex min-h-screen w-full flex-col items-center gap-y-6 p-3 sm:p-5 font-lexend">
      {/* Header with working History button & counter badge */}
      <div className="reveal-section section-delay-1 w-full flex justify-center">
        <Header
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
        />
      </div>

      {/* User Input with Clear button beside Scan Now (left side) */}
      <div className="reveal-section section-delay-2 w-full flex justify-center">
        <UserInput
          onScan={handleScan}
          loading={loading}
          hasResult={Boolean(scanResult)}
          onClear={handleClearResult}
        />
      </div>

      {/* Results Display */}
      <div className="reveal-section section-delay-3 w-full flex justify-center">
        <DisplayContainer
          scanResult={scanResult}
          loading={loading}
          error={error}
          onClearError={handleClearError}
        />
      </div>

      {/* History Modal Drawer */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearAllHistory={handleClearAllHistory}
      />
    </div>
  );
}

export default App;
