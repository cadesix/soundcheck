import React from 'react';

interface SongSummaryProps {
  summary?: string | null;
}

const SongSummary: React.FC<SongSummaryProps> = ({ summary }) => {
  if (!summary) return null;
  return (
    <div className="song-summary-container">
      <div className="song-summary-title">Video Trend Summary</div>
      <div className="song-summary-content p1">{summary}</div>
    </div>
  );
};

export default SongSummary; 