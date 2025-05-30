import React, { useState } from 'react';
import styles from './VideoTable.module.css';
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

const VideoRow: React.FC<{ video: Video }> = ({ video }) => {
  const creator = video.creator;
  return (
    <div className={styles['video-row']}>
      {video.thumbnail && (
        <a href={video.web_video_url} target="_blank" rel="noopener noreferrer">
          <img src={video.thumbnail} alt="thumbnail" className={styles['video-thumbnail']} />
        </a>
      )}
      <div className={styles['video-info-col']}>
        {creator ? (
          <a
            href={creator.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles['video-creator-link']}
          >
            {creator.name}
          </a>
        ) : (
          <span className={styles['video-creator-link']}>Unknown</span>
        )}
        <span className={styles['video-date']}>
          {new Date(video.date_posted).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
        <span className={styles['video-likes']}>
          Likes: {video.num_likes?.toLocaleString() ?? '0'}
        </span>
      </div>
      <span className={styles['video-viewcount']}>
        {video.num_views?.toLocaleString() ?? '0'} views
      </span>
    </div>
  );
};

const VideoTable: React.FC<VideoTableProps> = ({ videos }) => {
  const [sort, setSort] = useState('top');
  const [time, setTime] = useState('all');

  return (
    <div style={{ width: '100%', marginBottom: '2rem' }}>
      <TableHeader
        title="Videos"
        filter1={{ value: sort, onChange: setSort, options: sortOptions }}
        filter2={{ value: time, onChange: setTime, options: timeOptions }}
      />
      <div className={styles['video-table-container']}>
        {videos.length === 0 ? (
          <div className="no-videos p1">No videos found for this song.</div>
        ) : (
          videos.map(video => <VideoRow key={video.id} video={video} />)
        )}
      </div>
    </div>
  );
};

export default VideoTable; 