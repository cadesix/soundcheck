import React from 'react';
import Table, { TableColumn } from './Table';
import styles from './Table.module.css';
import { SimilarCreator } from '../types/creator';

interface SimilarCreatorsTableProps {
  similarCreators: SimilarCreator[];
}

const columns: TableColumn<SimilarCreator>[] = [
  {
    header: 'Creator Name',
    accessor: 'creator_name',
    render: (row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {row.image_url ? (
          <img
            src={row.image_url ?? undefined}
            alt={row.creator_name}
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e9e9e9' }} />
        )}
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <a href={row.creator_url ?? undefined} target="_blank" rel="noopener noreferrer" className={styles['data-table-link']}>
            {row.creator_name}
          </a>
          <span className="meta">Meta placeholder</span>
        </span>
      </span>
    ),
  },
  { header: 'Similar Artist', accessor: 'similar_artist_name' },
  { header: 'Views', accessor: 'views', render: () => 'VIEWS TO BE COMPUTED' },
];

const SimilarCreatorsTable: React.FC<SimilarCreatorsTableProps> = ({ similarCreators }) => {
  return (
    <Table columns={columns} data={similarCreators} title="Similar Creators" />
  );
};

export default SimilarCreatorsTable; 