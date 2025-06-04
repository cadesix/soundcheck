import React, { useEffect, useState } from 'react';
import Table, { TableColumn } from './Table';
import styles from './Table.module.css';
import songStyles from './SongsTable.module.css';
import { useRouter } from 'next/navigation';
import { getSongsViews } from '../../lib/viewService';

export interface SongRow {
  id: string;
  title: string;
  cover_url?: string | null;
  num_videos: number;
  // Add more fields as needed
}

interface SongWithViews extends SongRow {
  total_views?: number;
}

interface SongsTableProps {
  songs: SongRow[];
}

const columns: TableColumn<SongWithViews>[] = [
  {
    header: 'Song',
    accessor: 'title',
    render: (row) => (
      <div className={songStyles['song-row-content']}>
        {/* Cover Image */}
        {row.cover_url ? (
          <img
            src={row.cover_url}
            alt={row.title}
            className={songStyles['song-cover']}
          />
        ) : (
          <div className={songStyles['song-cover-placeholder']} />
        )}
        
        {/* Song Metadata */}
        <div className={songStyles['song-info-col']}>
          <span className={songStyles['song-title']}>{row.title}</span>
          <span className={songStyles['song-meta']}>
            Total plays: {row.total_views?.toLocaleString() ?? '—'}
          </span>
        </div>
      </div>
    ),
  },
  {
    header: 'Videos',
    accessor: 'num_videos',
    render: (row) => (
      <span className={songStyles['song-video-count']}>{row.num_videos}</span>
    ),
    className: songStyles['song-videos-col'],
  },
];

const SongsTable: React.FC<SongsTableProps> = ({ songs }) => {
  const router = useRouter();
  const [songsWithViews, setSongsWithViews] = useState<SongWithViews[]>(songs);

  useEffect(() => {
    const fetchViews = async () => {
      if (songs.length === 0) return;

      try {
        const songIds = songs.map(s => s.id);
        const viewsMap = await getSongsViews(songIds);
        
        // Merge view data with songs
        const withViews = songs.map(song => ({
          ...song,
          total_views: viewsMap.get(song.id) ?? 0
        }));
        
        setSongsWithViews(withViews);
      } catch (error) {
        console.error('Error fetching song views:', error);
        // Keep original songs if view fetch fails
        setSongsWithViews(songs);
      }
    };

    fetchViews();
  }, [songs]);

  return (
    <Table
      columns={columns}
      data={songsWithViews}
      className={styles['data-table-container']}
      onRowClick={row => router.push(`/songs/${row.id}`)}
    />
  );
};

export default SongsTable; 