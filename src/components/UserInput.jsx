import React from "react";
import "./UserInput.css";

const UserInput = () => {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-gray-200 bg-card p-4 shadow-md sm:p-6">
      <label className="mb-2 block text-lg font-lexend font-semibold text-gray-700">
        Analyze (Paste text/URL or upload screenshot/email file)
      </label>

      <form id="userForm" className="space-y-4">
        {/* <!-- Main Text / URL Input Area --> */}
        <div className="relative">
          <textarea
            id="inputContent"
            rows="5"
            className="w-full resize-none rounded-lg border border-gray-300 p-3 font-lexend text-md text-texts-primary focus:outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="Paste email text, a URL link, or drag & drop a screenshot/file below"
          ></textarea>
        </div>

        {/* <!-- File Upload & Submit Row --> */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          {/* <!-- File input for images, PDFs, or .eml files --> */}
          <div className="group relative flex items-center space-x-2 transition-all active:scale-98">
            <label
              className="inline-flex cursor-pointer items-center rounded-lg bg-gray-100 px-4 py-2 text-md font-medium text-gray-700 shadow-sm transition hover:bg-gray-200"
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
            className="w-full rounded-full bg-emerald-700 px-5 py-2 text-md font-lexend font-semibold text-white shadow transition-all hover:bg-emerald-800 active:scale-95 sm:w-auto"
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
