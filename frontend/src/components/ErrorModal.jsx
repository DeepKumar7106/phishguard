import React from "react";

const ErrorModal = ({ errorMessage, onClose }) => {
  if (!errorMessage) return null;

  return (
    <div className="w-full rounded-2xl bg-red-50 border border-red-300 p-4 shadow-md font-lexend flex items-start justify-between gap-3 animate-fadeIn">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <h4 className="text-sm font-bold text-red-800">Scan Notice</h4>
          <p className="text-xs sm:text-sm text-red-700 mt-0.5">{errorMessage}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 font-bold text-sm px-2 py-0.5 rounded transition"
          title="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorModal;
