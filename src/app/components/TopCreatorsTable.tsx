import React from 'react'
import Table, { TableColumn } from './Table'
import styles from './Table.module.css'
import { Creator } from '../types/creator';

interface TopCreatorsTableProps {
  topCreators: Creator[]
}

const columns: TableColumn<Creator>[] = [
  {
    header: 'Name',
    accessor: 'creator_name',
    className: styles['data-table-name'],
    render: (row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {row.image_url ? (
          <img
            src={row.image_url}
            alt={row.creator_name}
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e9e9e9' }} />
        )}
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <a href={row.creator_url} target="_blank" rel="noopener noreferrer" className={styles['data-table-link']}>
            {row.creator_name}
          </a>
          <span className="meta">Meta placeholder</span>
        </span>
      </span>
    ),
  },
  { header: 'Followers', accessor: 'num_followers', render: (row) => row.num_followers?.toLocaleString() ?? '—' },
  { header: 'Views', accessor: 'views', render: () => 'VIEWS TO BE COMPUTED' },
]

const TopCreatorsTable: React.FC<TopCreatorsTableProps> = ({ topCreators }) => {
  return (
    <Table columns={columns} data={topCreators} title="Top Creators" />
  )
}

export default TopCreatorsTable 