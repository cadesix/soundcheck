import React from 'react';
import styles from './SongSummary.module.css';

interface SongSummaryProps {
  summary?: string | null;
}

const SongSummary: React.FC<SongSummaryProps> = ({ summary }) => {
  if (!summary) return null;
  return (
    <div className={styles['song-summary-container']}>
      <div className={styles['song-summary-content'] + ' p1'}>{summary}</div>
    </div>
  );
};

export default SongSummary; 