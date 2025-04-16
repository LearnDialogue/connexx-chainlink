import React from 'react';
import '../styles/components/button.css';

interface ButtonProps {
  type: 'primary' | 'secondary' | 'warning' | 'transparent';
  disabled?: boolean;
  width?: number;
  children: React.ReactNode;
  onClick?: () => void;
  marginTop?: number;
  color?: string;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  type,
  width,
  disabled,
  children,
  onClick,
  marginTop,
  color,
  title,
}) => {
  const disabledStyle = disabled ? ' button-disabled' : '';

  if (type == 'warning') {
    return (
      <button
        disabled={disabled}
        onClick={onClick}
        className={'button button-warning' + disabledStyle}
        style={{ width: `${width ?? 100}%`, marginTop: `${marginTop ?? 0}px` }}
        title={title}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={'button button-' + type + disabledStyle}
      style={{
        width: `${width ?? 100}%`,
        marginTop: `${marginTop ?? 0}px`,
        backgroundColor: color,
      }}
      title={title}
    >
      {children}
    </button>
  );
};

export default Button;
