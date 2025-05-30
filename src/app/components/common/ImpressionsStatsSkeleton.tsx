import React from 'react';
import styles from '../ImpressionsStats.module.css';

const ImpressionsStatsSkeleton: React.FC = () => (
  <div className={styles['impressions-row']} style={{ marginBottom: 32 }}>
    {[...Array(2)].map((_, i) => (
      <div className={styles['impressions-card']} key={i}>
        <div style={{ width: 120, height: 18, background: '#ececf1', borderRadius: 4, marginBottom: 12 }} />
        <div style={{ width: 80, height: 28, background: '#ececf1', borderRadius: 6 }} />
      </div>
    ))}
  </div>
);

export default ImpressionsStatsSkeleton; 