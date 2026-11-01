import React from 'react'

const RiskScore = () => {
    window.addEventListener('DOMContentLoaded', () => {
        const riskBar = document.querySelector('.risk-bar');
        // const risk = parseInt(localStorage.getItem('riskScore'), 10);
        const risk = 75; // Example risk score, replace with actual value from localStorage or props
        // if(!riskBar) {
    //     return;
    // }

    const riskLevels = [
        { level: 'Low', color: '#4CAF50' },      // Green
        { level: 'Medium', color: '#FFEB3B' },   // Yellow
        { level: 'High', color: '#FF9800' },     // Orange
        { level: 'Critical', color: '#F44336' }  // Red
    ];

    if(risk > 0 && risk <= 25) {
        riskBar.style.width = '25%';
        riskBar.style.backgroundColor = riskLevels[0].color;
    }
    else if(risk > 25 && risk <= 50) {
        riskBar.style.width = '50%';
        riskBar.style.backgroundColor = riskLevels[1].color;
    }
    else if(risk > 50 && risk <= 75) {
        riskBar.style.width = '75%';
        riskBar.style.backgroundColor = riskLevels[2].color;
    }
    else if(risk > 75 && risk <= 100) {
        riskBar.style.width = '100%';
        riskBar.style.backgroundColor = riskLevels[3].color;
    }
    
});

  return (
    <>
        <div className="risk-container">
            <div className="risk-bar"></div>
        </div>
    </>
  )
}

export default RiskScore