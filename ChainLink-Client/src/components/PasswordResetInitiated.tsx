import React from 'react';
import '../styles/PasswordResetInitiated.css'; // Custom styles for the modal

interface PasswordResetInitiatedProps {
  message: string;
  onClose: () => void;
}

const PasswordResetInitiated: React.FC<PasswordResetInitiatedProps> = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose} className="modal-close-btn">OK</button>
      </div>
    </div>
  );
};

export default PasswordResetInitiated;