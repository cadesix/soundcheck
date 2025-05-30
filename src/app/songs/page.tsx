'use client';
import { useState, useMemo } from 'react';
import { useArtist } from '../context/ArtistContext';
import SongSummary from '../components/SongSummary';
import VideoTable from '../components/VideoTable';
import ImpressionsStats from '../components/ImpressionsStats';

export default function SongsPage() {
  const { artists, selectedArtistId } = useArtist();
  const selectedArtist = artists.find(a => a.id === selectedArtistId);
  const songs = selectedArtist?.songs || [];
  const [selectedSongId, setSelectedSongId] = useState(songs[0]?.id || '');

  // Find the selected song
  const selectedSong = useMemo(() => songs.find((s: any) => s.id === selectedSongId), [songs, selectedSongId]);
  // Videos for the selected song
  const videos = useMemo(() =>
    (selectedSong?.videos || []).map((video: any) => ({
      ...video,
      thumbnail: video.thumbnail_url,
    })),
    [selectedSong]
  );

  // Impressions calculations
  const totalImpressions = videos.reduce((sum: number, v: any) => sum + (v.num_views || 0), 0);
  const oneWeekAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);
  const impressionsThisWeek = videos.reduce(
    (sum: number, v: any) =>
      v.date_posted && new Date(v.date_posted) >= oneWeekAgo
        ? sum + (v.num_views || 0)
        : sum,
    0
  );

  return (
    <main className="container">
      {/* Impressions row */}
      <div className="impressions-row" style={{ marginBottom: 32 }}>
        <ImpressionsStats
          totalImpressions={totalImpressions}
          impressionsThisWeek={impressionsThisWeek}
        />
      </div>
      {/* Song chips row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        {songs.map((song: any) => (
          <button
            key={song.id}
            onClick={() => setSelectedSongId(song.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: song.id === selectedSongId ? '2px solid #2563eb' : '1.5px solid #ececf1',
              background: song.id === selectedSongId ? '#f3f4f6' : '#fff',
              borderRadius: 24,
              padding: '0.5rem 1.2rem',
              cursor: 'pointer',
              outline: 'none',
              minWidth: 80,
              boxShadow: song.id === selectedSongId ? '0 2px 8px rgba(37,99,235,0.08)' : 'none',
              transition: 'border 0.2s, background 0.2s',
            }}
          >
            {song.cover_url && (
              <img
                src={song.cover_url}
                alt={song.title}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: 8,
                  border: '1.5px solid #ececf1',
                  background: '#f3f4f6',
                }}
              />
            )}
            <span className="p1" style={{ textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</span>
          </button>
        ))}
      </div>
      {/* Song summary */}
      {selectedSong && <SongSummary summary={selectedSong.video_trend_analysis} />}
      {/* Video table */}
      <VideoTable videos={videos} />
    </main>
  );
} 