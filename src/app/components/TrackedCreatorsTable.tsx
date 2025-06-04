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
        <span className={styles['data-table-link']}>
          {row.name}
        </span>
      </span>
    ),
  },
  { header: '# Videos', accessor: 'num_videos' },
  { header: 'Total Impressions', accessor: 'total_impressions', render: (row) => row.total_impressions.toLocaleString() },
];

const TrackedCreatorsTable: React.FC<TrackedCreatorsTableProps> = ({ creators }) => {
  return (
    <div>
      <TableHeader title="Tracked Creators" />
      <Table 
        columns={columns} 
        data={creators}
        onRowClick={(creator) => {
          if (creator.profile_url) {
            window.open(creator.profile_url, '_blank');
          }
        }}
      />
    </div>
  );
};

export default TrackedCreatorsTable; 