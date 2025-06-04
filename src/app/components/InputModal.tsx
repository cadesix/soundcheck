import React from 'react';
import styles from './InputModal.module.css';

interface InputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  label?: string;
  placeholder?: string;
}

const InputModal: React.FC<InputModalProps> = ({
  open,
  onClose,
  onSubmit,
  value,
  onChange,
  loading = false,
  error = null,
  label = 'Submit a TikTok Creator URL',
  placeholder = 'https://www.tiktok.com/@username'
}) => {
  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.content}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            className={styles.input}
            disabled={loading}
            autoFocus
          />
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.buttonContainer}>
            <button 
              type="button" 
              onClick={handleCancel} 
              className={`${styles.button} ${styles.cancelButton}`}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`${styles.button} ${styles.submitButton}`}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputModal; 