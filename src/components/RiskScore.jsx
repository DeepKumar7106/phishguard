import React from "react";

const RiskScore = ({risk}) => {
  const riskBar = document.querySelector(".risk-bar");
  // const risk = parseInt(localStorage.getItem('riskScore'), 10);
//   const risk = 75; // Example risk score, replace with actual value from localStorage or props
  // if(!riskBar) {
  //     return;
  // }
  const safeRisk = Number(risk ?? 0);

  let width = "0%";
let color = "#4CAF50"; // Default to green for low risk


  const riskLevels = [
    { level: "Low", color: "#4CAF50" }, // Green
    { level: "Medium", color: "#FFEB3B" }, // Yellow
    { level: "High", color: "#FF9800" }, // Orange
    { level: "Critical", color: "#F44336" }, // Red
  ];

  if (safeRisk > 0 && safeRisk <= 25) {
    riskBar.style.width = "25%";
    riskBar.style.backgroundColor = riskLevels[0].color;
  } else if (safeRisk > 25 && safeRisk <= 50) {
    riskBar.style.width = "50%";
    riskBar.style.backgroundColor = riskLevels[1].color;
  } else if (safeRisk > 50 && safeRisk <= 75) {
    riskBar.style.width = "75%";
    riskBar.style.backgroundColor = riskLevels[2].color;
  } else if(safeRisk > 75 && safeRisk <= 100) {
    riskBar.style.width = "100%";
    riskBar.style.backgroundColor = riskLevels[3].color;
  }

  return (
    <>
      <div className="risk-container">
        <div className="risk-bar"
        style={{ width, backgroundColor: color }}></div>
      </div>
    </>
  );
};

export default RiskScore;


// const [risk, setRisk] = useState(null);

// useEffect(() => {
//   fetch("/api/risk")
//     .then(res => res.json())
//     .then(data => setRisk(data.score));
// }, []);