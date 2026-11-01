import React from "react";

const ErrorModal = ({ errorMessage }) => {
  if (!errorMessage) return null;

  return (
    <div className="error-modal-container">
      <div className="error-modal-panel" role="alert">
        <div className="error-modal-header">
          <h3>Error</h3>
        </div>
        <p>{errorMessage}</p>
      </div>
    </div>
  );
};

export default ErrorModal;
