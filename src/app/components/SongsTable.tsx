import React from 'react';
import Table, { TableColumn } from './Table';
import styles from './Table.module.css';
import { useRouter } from 'next/navigation';

export interface SongRow {
  id: string;
  title: string;
  cover_url?: string | null;
  num_videos: number;
  // Add more fields as needed
}

interface SongsTableProps {
  songs: SongRow[];
}

const columns: TableColumn<SongRow>[] = [
  {
    header: '',
    accessor: 'cover_url',
    render: (row) => (
      row.cover_url ? (
        <img
          src={row.cover_url}
          alt={row.title}
          style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #ececf1', background: '#f3f4f6' }}
        />
      ) : (
        <div style={{ width: 48, height: 48, borderRadius: 8, background: '#ececf1' }} />
      )
    ),
  },
  {
    header: 'Song',
    accessor: 'title',
    render: (row) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontWeight: 600 }}>{row.title}</span>
        <span className="meta">Total plays: —</span>
      </div>
    ),
  },
  {
    header: 'Videos',
    accessor: 'num_videos',
    render: (row) => (
      <span style={{ fontWeight: 500, marginLeft: 'auto', display: 'block', textAlign: 'right' }}>{row.num_videos}</span>
    ),
    className: styles['data-table-videos-col'],
  },
];

const SongsTable: React.FC<SongsTableProps> = ({ songs }) => {
  const router = useRouter();
  return (
    <Table
      columns={columns}
      data={songs}
      className={styles['data-table-container']}
      onRowClick={row => router.push(`/songs/${row.id}`)}
    />
  );
};

export default SongsTable; 