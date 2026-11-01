import React from "react";
import "./UserInput.css";

const UserInput = () => {
  return (
    <div className="mx-auto mt-8 w-full max-w-5xl rounded-[28px] border border-white/30 bg-[#ebf1f4] p-4 shadow-[10px_10px_20px_rgba(163,177,198,0.2),0px_0px_20px_rgba(255,255,255,0.9)] sm:p-6 lg:p-7 sm:mt-4">
      <label className="mb-3 block text-lg font-lexend font-semibold text-slate-700 sm:text-xl">
        Analyze (Paste text/URL or upload screenshot/email file)
      </label>

      <form id="userForm" className="space-y-4">
        {/* <!-- Main Text / URL Input Area --> */}
        <div className="relative">
          <textarea
            id="inputContent"
            rows="5"
            className="w-full resize-none rounded-2xl border border-transparent bg-[#edf3f7] p-3 font-lexend text-base text-slate-700 shadow-[inset_8px_8px_16px_rgba(163,177,198,0.18),inset_-8px_-8px_16px_rgba(255,255,255,0.9)] transition focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
            placeholder="Paste email text, a URL link, or drag & drop a screenshot/file below"
          ></textarea>
        </div>

        {/* <!-- File Upload & Submit Row --> */}
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          {/* <!-- File input for images, PDFs, or .eml files --> */}
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
              Upload File / Image
              <input
                type="file"
                id="fileInput"
                className="hidden"
                accept="image/*,.eml,.msg,.pdf"
              />
            </label>

            <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1">
              Upload a file (image, PDF, .eml, or .msg)
            </span>
          </div>

          {/* <!-- Submit Button --> */}
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-2.5 text-base font-lexend font-semibold text-white shadow-[6px_6px_14px_rgba(43,120,92,0.35),-4px_-4px_10px_rgba(255,255,255,0.14)] transition-all hover:brightness-105 active:scale-95 sm:w-auto"
          >
            Scan
          </button>
        </div>
      </form>
      {/* 
<script>
  // Simple script to show selected file name
  document.getElementById('fileInput').addEventListener('change', function(e) {
    const fileName = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
    document.getElementById('fileName').textContent = fileName;
  });
</script> */}
    </div>
  );
};

export default UserInput;
