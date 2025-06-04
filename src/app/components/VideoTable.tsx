import React, { useState } from 'react';
import Table, { TableColumn } from './Table';
import styles from './Table.module.css';
import videoStyles from './VideoTable.module.css';
import TableHeader from './TableHeader';
import { Video } from '../types/video';

interface VideoTableProps {
  videos: Video[];
}

const sortOptions = [
  { value: 'top', label: 'Top' },
  { value: 'recent', label: 'Recent' },
];
const timeOptions = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

const columns: TableColumn<Video>[] = [
  {
    header: 'Video',
    accessor: 'thumbnail',
    render: (video) => (
      <div className={videoStyles['video-row-content']}>
        {/* Thumbnail */}
        {video.thumbnail ? (
          <img 
            src={video.thumbnail} 
            alt="thumbnail" 
            className={videoStyles['video-thumbnail']} 
          />
        ) : (
          <div className={videoStyles['video-thumbnail']} style={{ background: 'var(--color-grey-skeleton)' }} />
        )}
        
        {/* Metadata */}
        <div className={videoStyles['video-info-col']}>
          {video.creator ? (
            <a
              href={video.creator.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className={videoStyles['video-creator-link']}
              onClick={(e) => e.stopPropagation()}
            >
              {video.creator.name}
            </a>
          ) : (
            <span className={videoStyles['video-creator-link']}>Unknown</span>
          )}
          <span className={videoStyles['video-date']}>
            {new Date(video.date_posted).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
          <span className={videoStyles['video-likes']}>
            Likes: {video.num_likes?.toLocaleString() ?? '0'}
          </span>
        </div>
      </div>
    ),
  },
  {
    header: 'Views',
    accessor: 'num_views',
    render: (video) => (
      <span className={videoStyles['video-viewcount']}>
        {video.num_views?.toLocaleString() ?? '0'} views
      </span>
    ),
    className: videoStyles['video-views-col'],
  },
];

const VideoTable: React.FC<VideoTableProps> = ({ videos }) => {
  const [sort, setSort] = useState('top');
  const [time, setTime] = useState('all');

  if (videos.length === 0) {
    return (
      <div style={{ width: '100%', marginBottom: '2rem' }}>
        <TableHeader
          title="Videos"
          filter1={{ value: sort, onChange: setSort, options: sortOptions }}
          filter2={{ value: time, onChange: setTime, options: timeOptions }}
        />
        <div className={styles['data-table-container']}>
          <div className="no-videos p1" style={{ padding: '2rem', textAlign: 'center' }}>
            No videos found for this song.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', marginBottom: '2rem' }}>
      <TableHeader
        title="Videos"
        filter1={{ value: sort, onChange: setSort, options: sortOptions }}
        filter2={{ value: time, onChange: setTime, options: timeOptions }}
      />
      <Table 
        columns={columns} 
        data={videos} 
        className={styles['data-table-container']}
        onRowClick={(video) => {
          console.log('Clicking video:', video);
          console.log('Video URL:', video.web_video_url);
          if (video.web_video_url) {
            window.open(video.web_video_url, '_blank');
          } else {
            console.warn('No video URL found for video:', video);
          }
        }}
      />
    </div>
  );
};

export default VideoTable; 