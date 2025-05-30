import React, { useState } from 'react';
import TableHeader from '../TableHeader';
import styles from '../VideoTable.module.css';

const sortOptions = [
  { value: 'top', label: 'Top' },
  { value: 'recent', label: 'Recent' },
];
const timeOptions = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

const VideosTableSkeleton: React.FC = () => {
  const [sort] = useState('top');
  const [time] = useState('all');
  return (
    <div style={{ width: '100%', marginBottom: '2rem' }}>
      <TableHeader
        title="Videos"
        filter1={{ value: sort, onChange: () => {}, options: sortOptions }}
        filter2={{ value: time, onChange: () => {}, options: timeOptions }}
      />
      <div className={styles['video-table-container']}>
        {[...Array(4)].map((_, i) => (
          <div className={styles['video-row']} key={i}>
            <div className={styles['video-thumbnail']} style={{ background: '#ececf1' }} />
            <div className={styles['video-info-col']}>
              <div className={styles['video-title-skeleton']} />
              <div className={styles['video-meta-skeleton']} />
              <div className={styles['video-meta-skeleton']} style={{ width: 80 }} />
            </div>
            <div className={styles['video-viewcount-skeleton']} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideosTableSkeleton; 