import React from 'react'

const ReportSite = () => {
  return (
    <>
        <div className="report-site-container bg-card3 p-4 rounded-lg mt-4 shadow-sm">
          <h3 className="report-site-header text-2xl text-amber-50 font-semibold">Report a Scam Site:</h3>
            <p className="report-site-content text-gray-100">If you have encountered a scam site, please report it to help protect others. You can submit the URL of the scam site along with any relevant details.</p>

            <button className="report-site-button font-lexend text-sm mt-3 px-4 py-2 bg-blue-900 text-white font-semibold rounded-full hover:bg-blue-800 transition-all flex items-center justify-center active:scale-95">
              Report Scam Site
            </button>
        </div>  
    </>
  )
}

export default ReportSite