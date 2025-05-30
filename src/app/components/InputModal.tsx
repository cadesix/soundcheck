import React from 'react';

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
  placeholder = 'Paste TikTok creator URL here...'
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
    <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="modal-content" style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <h2 style={{ marginBottom: 16 }}>{label}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ececf1', marginBottom: 16 }}
            disabled={loading}
            autoFocus
          />
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={handleCancel} style={{ padding: '8px 18px', borderRadius: 6, border: '1px solid #ececf1', background: '#f3f4f6', color: '#18181b', cursor: 'pointer' }} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 500, cursor: 'pointer' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputModal; 