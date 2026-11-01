import React from 'react'
import SendToast from './SendToast'
import RiskScore from './RiskScore'
import ScanSummary from './ScanSummary'
import Graph from './Graph'
import Suggestion from './Suggestion'
import ReportSite from './ReportSite'


const DisplayContainer = () => {
  return (
    <>
        {/* <SendToast></SendToast> */}
        <div className="container mt-8 flex flex-col items-start justify-center gap-y-6 w-8/12 p-5">
            {/* this is a progress bar ahh that shows the risk score */}
            <RiskScore />

            {/* this is a summary of the scan results */}
            <ScanSummary summary="Scan results summary will be displayed here." />


            {/* this is a chart to show historical data  ----   API */}
            <Graph searchQuery="example.com" />

            {/* this is a suggestion based on the scan results ----   API  */}
            <Suggestion suggestion="Based on the scan results, it is recommended to avoid interacting with this domain/email." />

            <ReportSite />
        </div>
    </>
  )
}

export default DisplayContainer


// useEffect(() => {
//   const timer = setTimeout(() => {
//     // Do something
//   }, 3000);

//   // Runs automatically when the component is removed/unmounted
//   return () => clearTimeout(timer);
// }, []);