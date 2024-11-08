import React from 'react';

interface PasswordValidationProps {
  password: string;
  confirmPassword: string;
}

const PasswordValidation: React.FC<PasswordValidationProps> = ({ password, confirmPassword }) => {
  if (password === '' || confirmPassword === '') return null;

  const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordCriteria.test(password)) {
    return (
      <span>
        <i className='fa-solid fa-circle-xmark'></i>
      </span>
    );
  }

  if (password !== confirmPassword) {
    return (
      <span>
        <i className='fa-solid fa-circle-xmark'></i>
      </span>
    );
  }

  return (
    <span>
      <i className='fa-solid fa-circle-check'></i>
    </span>
  );
};

export default PasswordValidation;