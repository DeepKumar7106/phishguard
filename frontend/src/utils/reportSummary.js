/**
 * PhishGuard Threat Report Summary & Title Utilities
 * Formats user threat submissions into clean, executive, human-readable summary titles
 * replacing raw cryptographic hashes with actionable threat metadata.
 */

/**
 * Checks if a string is a cryptographic hash (e.g. 64-char SHA-256 or 32-char MD5).
 * Raw cryptographic hashes should never be presented to the user as titles or targets.
 *
 * @param {any} val
 * @returns {boolean}
 */
export function isHash(val) {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  return /^[a-f0-9]{32,64}$/i.test(trimmed);
}

/**
 * Derives a human-readable summarized report title from scan results.
 * Satisfies the requirement: "make the title of the submission of the report
 * as the summaris format of the issue submitted".
 *
 * @param {Object} scanResult - Backend analysis verdict and metadata.
 * @param {string} [fallbackTarget=""] - Alternative target string if scanResult is partial.
 * @returns {string} Formatted summary title.
 */
export function deriveReportSummaryTitle(scanResult, fallbackTarget = "") {
  if (!scanResult) {
    if (fallbackTarget && !isHash(fallbackTarget)) {
      return `[Scam Report] ${fallbackTarget.trim()}`;
    }
    return "";
  }

  const verdict = scanResult.verdict || {};
  const riskLevel = verdict.risk_level || "High";
  const matchedPattern = verdict.matched_pattern_details;
  const primaryDomain =
    scanResult.metadataChecks?.domains?.find((d) => !d.isIp)?.domain ||
    scanResult.metadataChecks?.domains?.[0]?.domain;
  const statutory = scanResult.statutoryIdentifiers;
  const redFlags = Array.isArray(verdict.red_flags) ? verdict.red_flags : [];
  const explanation = verdict.explanation || "";

  // 1. Risk Tag Prefix
  const riskTag =
    riskLevel === "Critical"
      ? "[Critical Scam Threat]"
      : riskLevel === "High"
      ? "[High Risk Scam]"
      : riskLevel === "Medium"
      ? "[Suspicious Warning]"
      : "[Security Advisory]";

  // 2. Matched Indian Scam Pattern (e.g., IN-2002 Graduate Trainee Deposit, IN-2001 Microtask)
  if (matchedPattern?.title) {
    const patternTitle = matchedPattern.title.replace(/\s+/g, " ").trim();

    // Extract short trap phrase from financialTrap if present
    let trapPhrase = "";
    if (matchedPattern.financialTrap) {
      const firstPart = matchedPattern.financialTrap.split(/[:;.]/)[0].trim();
      if (firstPart.length > 0 && firstPart.length <= 45) {
        trapPhrase = firstPart;
      }
    }

    if (primaryDomain) {
      return `${riskTag} ${primaryDomain} - ${patternTitle}${trapPhrase ? ` (${trapPhrase})` : ""}`;
    }
    return `${riskTag} ${patternTitle}${trapPhrase ? ` - ${trapPhrase}` : ""}`;
  }

  // 3. Early-Stage / Day-0 Startup Verification with MCA / GSTIN / DPIIT
  if (statutory?.hasStatutoryProof) {
    const idSnippet = statutory.cins?.[0]
      ? `CIN: ${statutory.cins[0]}`
      : statutory.gstins?.[0]
      ? `GSTIN: ${statutory.gstins[0]}`
      : statutory.dpiitIds?.[0]
      ? `DPIIT: ${statutory.dpiitIds[0]}`
      : statutory.llpins?.[0]
      ? `LLPIN: ${statutory.llpins[0]}`
      : "Statutory Filing Proof";

    return `[Provisional Risk] New Startup Verification (${idSnippet})`;
  }

  // 4. Primary Domain / Lookalike Phishing Portal
  if (primaryDomain) {
    const domainFlag =
      redFlags.length > 0
        ? ` - ${redFlags[0].replace(/^[•\-\*\s]+/, "").slice(0, 50)}`
        : " - Suspicious Domain";
    return `${riskTag} ${primaryDomain}${domainFlag}`;
  }

  // 5. Key Red Flag from Analyzed Threat
  if (redFlags.length > 0) {
    const topFlag = redFlags[0]
      .replace(/^[•\-\*\s]+/, "")
      .replace(/\s+/g, " ")
      .trim();
    if (topFlag.length > 5) {
      return `${riskTag} ${topFlag.slice(0, 80)}`;
    }
  }

  // 6. Verdict Explanation Summary
  if (explanation) {
    const firstSentence = explanation
      .split(/[.!?\n]/)[0]
      .replace(/\s+/g, " ")
      .trim();
    if (firstSentence.length > 5) {
      return `${riskTag} ${firstSentence.slice(0, 80)}`;
    }
  }

  // 7. Cleaned text snippet fallback (avoiding hashes)
  const cleanedText = scanResult.preprocessing?.cleanedText || "";
  if (cleanedText) {
    const snippet = cleanedText.replace(/\s+/g, " ").trim().slice(0, 60);
    if (snippet.length > 5 && !isHash(snippet)) {
      return `${riskTag} "${snippet}..."`;
    }
  }

  // 8. Safe Fallback Target
  if (fallbackTarget && !isHash(fallbackTarget)) {
    return `${riskTag} ${fallbackTarget.trim()}`;
  }

  return `${riskTag} Community Threat Submission`;
}

/**
 * Derives pre-populated description details from scan results.
 *
 * @param {Object} scanResult
 * @returns {string}
 */
export function deriveReportDescription(scanResult) {
  if (!scanResult) return "";
  const verdict = scanResult.verdict || {};
  const matchedPattern = verdict.matched_pattern_details;
  const redFlags = Array.isArray(verdict.red_flags) ? verdict.red_flags : [];
  const parts = [];

  if (verdict.explanation && verdict.explanation.trim()) {
    parts.push(verdict.explanation.trim());
  }

  if (matchedPattern?.financialTrap && matchedPattern.financialTrap.trim()) {
    parts.push(`Financial Trap: ${matchedPattern.financialTrap.trim()}`);
  }

  if (redFlags.length > 0) {
    parts.push(`Red Flags:\n${redFlags.map((f) => `• ${f}`).join("\n")}`);
  }

  return parts.join("\n\n");
}
