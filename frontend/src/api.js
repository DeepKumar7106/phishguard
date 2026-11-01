/**
 * PhishGuard Centralized API Client.
 * Connects the React frontend to the Express backend.
 */

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

/**
 * Analyzes text, email, link, or uploaded screenshot for fraud, phishing, and scam vectors.
 *
 * @param {Object} options
 * @param {string} [options.content] - Text, email, or URL content.
 * @param {File} [options.file] - Screenshot, image, or document file.
 * @param {string} [options.inputType='text'] - 'text', 'url', 'image', 'image_text', or 'email'.
 * @returns {Promise<Object>} Backend analysis result.
 */
export async function analyzeThreat({ content, file, inputType = 'text' }) {
  let response;

  if (file) {
    const formData = new FormData();
    formData.append('image', file);
    if (content && typeof content === 'string' && content.trim()) {
      formData.append('content', content.trim());
    }
    formData.append('inputType', 'image');

    response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      body: formData,
    });
  } else {
    if (!content || typeof content !== 'string' || !content.trim()) {
      throw new Error('Please enter text, paste a URL/email, or upload an image file.');
    }

    response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputType: inputType || 'text',
        content: content.trim(),
      }),
    });
  }

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || data.message || `Analysis failed with status ${response.status}`);
  }

  return data;
}

/**
 * Fetches historical scam and threat report counts for a domain, IP, or hash.
 *
 * @param {string} target - Domain, IP, or SHA-256 content hash.
 * @returns {Promise<{ target: string, totalReports: number, timeSeries: Array<{ date: string, count: number }> }>}
 */
export async function getScamHistory(target) {
  if (!target || typeof target !== 'string') {
    return { target: '', totalReports: 0, timeSeries: [] };
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/scam-history?target=${encodeURIComponent(target.trim())}&_t=${Date.now()}`
    );

    if (!response.ok) {
      return { target, totalReports: 0, timeSeries: [] };
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('[api] Failed to fetch scam history:', err.message);
    return { target, totalReports: 0, timeSeries: [] };
  }
}

/**
 * Submits a verified scam report to the community threat intelligence database.
 *
 * @param {Object} reportData
 * @param {string} reportData.targetEndpoint - Target URL, email, or handle.
 * @param {string} [reportData.domain] - Associated domain name.
 * @param {string} [reportData.inputType='url'] - Input modality.
 * @returns {Promise<Object>}
 */
export async function submitScamReport({ targetEndpoint, domain, inputType = 'url' }) {
  if (!targetEndpoint || !targetEndpoint.trim()) {
    throw new Error('Please provide the scam URL, domain, or email address.');
  }

  const payload = {
    targetEndpoint: targetEndpoint.trim(),
    inputType,
  };

  if (domain && domain.trim()) {
    payload.domain = domain.trim();
  }

  const response = await fetch(`${API_BASE}/api/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to submit scam report.');
  }

  return data;
}

export default {
  analyzeThreat,
  getScamHistory,
  submitScamReport,
};
