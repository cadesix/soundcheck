import React from 'react'
import styles from './ImpressionsStats.module.css'

interface ImpressionsStatsProps {
  totalImpressions: number
  impressionsThisWeek: number
}

const ImpressionsStats: React.FC<ImpressionsStatsProps> = ({ totalImpressions, impressionsThisWeek }) => (
  <div className={styles['impressions-row']} style={{ marginBottom: 32 }}>
    <div className={styles['impressions-card']}>
      <div className={styles['impressions-label']}>Total Impressions</div>
      <div className={`${styles['impressions-value']} h1`}>{totalImpressions.toLocaleString()}</div>
    </div>
    <div className={styles['impressions-card']}>
      <div className={styles['impressions-label']}>Impressions This Week</div>
      <div className={`${styles['impressions-value']} h1`}>{impressionsThisWeek.toLocaleString()}</div>
    </div>
  </div>
)

export default ImpressionsStats 