import { useState, useRef } from "react";
import "./UserInput.css";

const UserInput = ({ onScan, loading, hasResult, onClear }) => {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setContent("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onClear) {
      onClear();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    } else {
      const text = e.dataTransfer.getData("text");
      if (text) {
        setContent((prev) => (prev ? `${prev}\n${text}` : text));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) {
      return;
    }
    if (onScan) {
      onScan({
        content: content.trim(),
        file: selectedFile,
      });
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`mx-auto mt-8 w-full max-w-5xl rounded-[28px] border transition-all duration-200 bg-[#ebf1f4] p-4 shadow-[10px_10px_20px_rgba(163,177,198,0.2),0px_0px_20px_rgba(255,255,255,0.9)] sm:p-6 lg:p-7 sm:mt-4 ${
        dragOver ? "border-emerald-500 bg-emerald-50/50 scale-[1.01]" : "border-white/30"
      }`}
    >
      <label
        htmlFor="inputContent"
        className="mb-3 block text-lg font-lexend font-semibold text-slate-700 sm:text-xl"
      >
        Analyze (Paste text, job offer, email, URL link, or upload screenshot)
      </label>

      <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
        {/* Main Text / URL Input Area */}
        <div className="relative">
          <textarea
            id="inputContent"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full resize-none rounded-2xl border border-transparent bg-[#edf3f7] p-3 font-lexend text-base text-slate-700 shadow-[inset_8px_8px_16px_rgba(163,177,198,0.18),inset_-8px_-8px_16px_rgba(255,255,255,0.9)] transition focus:outline-none focus:ring-2 focus:ring-emerald-500/70 disabled:opacity-60"
            placeholder="Paste suspicious WhatsApp message, recruiter email, offer letter text, job link, or drag & drop an image screenshot below..."
          ></textarea>
        </div>

        {/* Selected File Badge */}
        {selectedFile && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-800 animate-fadeIn">
            <div className="flex items-center gap-2 truncate">
              <svg className="h-5 w-5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="font-semibold truncate">{selectedFile.name}</span>
              <span className="text-xs text-emerald-600">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="ml-3 text-emerald-700 hover:text-red-600 font-bold text-base px-1.5 rounded transition cursor-pointer"
              title="Remove file"
            >
              ✕
            </button>
          </div>
        )}

        {/* File Upload & Submit Row */}
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          {/* File input for images, PDFs, or .eml files */}
          <div className="group relative flex items-center transition-all active:scale-98">
            <label
              className="inline-flex cursor-pointer items-center rounded-xl bg-[#ebf1f4] px-4 py-2.5 text-sm font-medium text-slate-700 shadow-[6px_6px_12px_rgba(163,177,198,0.18),-6px_-6px_12px_rgba(255,255,255,0.9)] transition hover:shadow-[inset_3px_3px_8px_rgba(163,177,198,0.15),inset_-3px_-3px_8px_rgba(255,255,255,0.9)] sm:text-base"
              aria-label="Upload a file (image, PDF, .eml, or .msg)"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              {selectedFile ? "Change Screenshot / File" : "Upload Screenshot / File"}
              <input
                ref={fileInputRef}
                type="file"
                id="fileInput"
                className="hidden"
                accept="image/*,.eml,.msg,.pdf"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>

            <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1">
              Supports screenshots (PNG, JPG, WebP), PDFs, or emails
            </span>
          </div>

          {/* Action Buttons: Clear Button (on left side) & Submit Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {hasResult && (
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2.5 text-base font-lexend font-semibold shadow-[4px_4px_10px_rgba(163,177,198,0.25),-4px_-4px_10px_rgba(255,255,255,0.9)] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title="Clear current scan results"
              >
                <span>✕</span> Clear Result
              </button>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!content.trim() && !selectedFile)}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 px-7 py-2.5 text-base font-lexend font-semibold text-white shadow-[6px_6px_14px_rgba(43,120,92,0.35),-4px_-4px_10px_rgba(255,255,255,0.14)] transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Scanning Threat...
                </span>
              ) : (
                "Scan Now"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserInput;
