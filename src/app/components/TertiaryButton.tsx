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
        border: 'none',
        color: 'var(--color-grey-text)',
        font: 'var(--text-meta)',
        padding: '6px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'opacity 0.15s ease',
        alignSelf: 'flex-start',
        width: 'fit-content',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default TertiaryButton; 