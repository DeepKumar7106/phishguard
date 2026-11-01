import React from 'react'
import SendToast from './SendToast'
import RiskScore from './RiskScore'
const DisplayContainer = () => {
  return (
    <>
        {/* <SendToast></SendToast> */}
        <div className="container mt-8">
            <RiskScore />
        </div>
    </>
  )
}

export default DisplayContainer