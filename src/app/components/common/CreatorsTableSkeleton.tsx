import React from 'react';
import TableHeader from '../TableHeader';
import styles from '../Table.module.css';

const CreatorsTableSkeleton: React.FC = () => (
  <>
    <TableHeader title="Tracked Creators" />
    <div className={styles['data-table-container']}>
      <table className={styles['data-table']}>
        <thead>
          <tr>
            <th className={styles['data-table-name']}>Name</th>
            <th className={styles['data-table-th']}># Videos</th>
            <th className={styles['data-table-th']}>Total Impressions</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(4)].map((_, i) => (
            <tr className={styles['data-table-tr']} key={i}>
              <td className={styles['data-table-td']}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={styles['data-table-avatar-skeleton']} />
                  <div className={styles['data-table-text-skeleton']} />
                </span>
              </td>
              <td className={styles['data-table-td']}><div className={styles['data-table-text-skeleton']} style={{ width: 60 }} /></td>
              <td className={styles['data-table-td']}><div className={styles['data-table-text-skeleton']} style={{ width: 90 }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

export default CreatorsTableSkeleton; 