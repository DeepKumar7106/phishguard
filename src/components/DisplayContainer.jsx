import React from 'react'
import SendToast from './SendToast'
import RiskScore from './RiskScore'
import ScanSummary from './ScanSummary'
import Graph from './Graph'

const DisplayContainer = () => {
  return (
    <>
        {/* <SendToast></SendToast> */}
        <div className="container mt-8 flex flex-col items-center justify-center gap-y-4 w-8/12 p-5">
            {/* this is a progress bar ahh that shows the risk score */}
            <RiskScore />

            {/* this is a summary of the scan results */}
            <ScanSummary summary="Scan results summary will be displayed here." />


            {/* this is a chart to show historical data */}
            <Graph searchQuery="example.com" />
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