import React from 'react';
import Table, { TableColumn } from './Table';
import TableHeader from './TableHeader';
import styles from './Table.module.css';
import { TrackedCreator } from '../types/creator';

interface TrackedCreatorsTableProps {
  creators: TrackedCreator[];
  className?: string;
}

const columns: TableColumn<TrackedCreator>[] = [
  {
    header: 'Name',
    accessor: 'name',
    render: (row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {row.image_url ? (
          <img
            src={row.image_url}
            alt={row.name}
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e9e9e9' }} />
        )}
        <a href={row.profile_url} target="_blank" rel="noopener noreferrer" className={styles['data-table-link']}>
          {row.name}
        </a>
      </span>
    ),
  },
  { header: '# Videos', accessor: 'num_videos' },
  { header: 'Total Impressions', accessor: 'total_impressions', render: (row) => row.total_impressions.toLocaleString() },
];

const TrackedCreatorsTable: React.FC<TrackedCreatorsTableProps> = ({ creators }) => {
  return (
    <>
      <TableHeader title="Tracked Creators" />
      <Table columns={columns} data={creators} />
    </>
  );
};

export default TrackedCreatorsTable; 