import React, { useEffect, useState } from 'react'
import Table, { TableColumn } from './Table'
import styles from './Table.module.css'
import { Creator } from '../types/creator';
import { getCreatorsViews } from '../../lib/viewService';

interface TopCreatorsTableProps {
  topCreators: Creator[]
}

interface CreatorWithViews extends Creator {
  total_views?: number;
}

const columns: TableColumn<CreatorWithViews>[] = [
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
  { 
    header: 'Views', 
    accessor: 'total_views', 
    render: (row) => row.total_views?.toLocaleString() ?? '—' 
  },
]

const TopCreatorsTable: React.FC<TopCreatorsTableProps> = ({ topCreators }) => {
  const [creatorsWithViews, setCreatorsWithViews] = useState<CreatorWithViews[]>(topCreators);

  useEffect(() => {
    const fetchViews = async () => {
      if (topCreators.length === 0) return;

      try {
        const creatorIds = topCreators.map(c => c.id);
        const viewsMap = await getCreatorsViews(creatorIds);
        
        // Merge view data with creators
        const withViews = topCreators.map(creator => ({
          ...creator,
          total_views: viewsMap.get(creator.id) ?? 0
        }));
        
        setCreatorsWithViews(withViews);
      } catch (error) {
        console.error('Error fetching views:', error);
        // Keep original creators if view fetch fails
        setCreatorsWithViews(topCreators);
      }
    };

    fetchViews();
  }, [topCreators]);

  return (
    <Table columns={columns} data={creatorsWithViews} title="Top Creators" />
  )
}

export default TopCreatorsTable 