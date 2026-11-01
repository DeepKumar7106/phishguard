import React from 'react'
const ScanSummary = ({summary}) => {
  return (
    <>
        <div className="summary-display font-lexend text-lg text-texts-primary mt-8">
            <h1 className="text-xl font-lexend font-bold mb-2">Summary:</h1>
            {summary}
        </div>
    </>
  )
}

export default ScanSummary