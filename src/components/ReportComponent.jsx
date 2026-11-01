import React from "react";

// this is where user will submit a report about a scam site, email, or other suspicious activity. It will include a form for the user to fill out with details about the scam, and a submit button to send the report to the backend for processing.
const ReportComponent = () => {
  return (
    <>
      <div className="report-component-container bg-card p-6 rounded-lg mt-8 shadow-md">
        <h3 className="report-component-header text-2xl text-gray-900 font-semibold font-lexend text-center">
          Report a Scam:
        </h3>
        <form method="post" action="" className="flex flex-col items-center">
          <p className="report-component-content text-gray-800 font-poppins w-full text-center">
            If you have encountered a scam site, email, or other suspicious
            activity, please report it to help protect others. You can submit
            the URL of the scam site, email address, or any relevant details.
          </p>

          <label
            className="report-component-label text-gray-800 mt-3 block font-semibold w-full"
            htmlFor="scamUrl"
          >
            Scam URL / Email:
          </label>
          <textarea
            type="text"
            id="scamUrl"
            name="scamUrl"
            className="report-component-input bg-gray-100 px-4 py-2 text-gray-900 placeholder:text-gray-500 border border-gray-600 min-h-25 rounded-md w-full focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="Enter the URL or email address of the scam"
          ></textarea>

          <label
            className="report-component-label text-gray-800 mt-3 block font-semibold w-full"
            htmlFor="issueDescription"
          >
            Describe Your Issue:
          </label>
          <textarea
            type="text"
            id="issueDescription"
            name="issueDescription"
            className="report-component-input bg-gray-100 px-4 py-2 text-gray-900 placeholder:text-gray-500 border border-gray-600 min-h-25 rounded-md w-full focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="Provide a detailed description of the scam you encountered"
          ></textarea>

          <button className="report-component-button font-lexend text-sm mt-3 px-4 py-2 bg-blue-900 text-white font-semibold rounded-full hover:bg-blue-800 transition-all flex items-center justify-center active:scale-95 mx-auto">
            Report Scam
          </button>
        </form>
      </div>
    </>
  );
};

export default ReportComponent;
