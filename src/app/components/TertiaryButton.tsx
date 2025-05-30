import React from 'react';

interface TertiaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const TertiaryButton: React.FC<TertiaryButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      type="button"
      className={className}
      style={{
        background: 'none',
        border: 'none',
        color: '#2563eb',
        fontWeight: 500,
        fontSize: 15,
        cursor: 'pointer',
        padding: 0,
        marginBottom: 24,
        marginLeft: 4,
        display: 'inline',
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default TertiaryButton; 