import React from 'react'

const Suggestion = ({ suggestion }) => {
  return (
    <>
        <div className="suggestion-container bg-card2 p-6 rounded-lg mt-4 shadow-sm">
          <h3 className="suggestion-header text-2xl text-amber-50 font-semibold font-lexend">Future Actions:</h3>
            <p className="suggestion-content text-gray-100 font-poppins">{suggestion}</p>
        </div>
    </>
  )
}

export default Suggestion