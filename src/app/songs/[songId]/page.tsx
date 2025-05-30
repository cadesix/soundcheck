'use client';

import { useParams } from 'next/navigation';
import { useArtist } from '../../context/ArtistContext';
import ImpressionsStats from '../../components/ImpressionsStats';
import SongSummary from '../../components/SongSummary';
import VideoTable from '../../components/VideoTable';
import React, { useMemo } from 'react';
import Link from 'next/link';

export default function SongDetailView() {
  const { songId } = useParams();
  const { artists, selectedArtistId } = useArtist();
  const selectedArtist = artists.find(a => a.id === selectedArtistId);
  const songs = selectedArtist?.songs || [];
  const song = useMemo(() => songs.find((s: any) => s.id === songId), [songs, songId]);
  const videos = useMemo(() =>
    (song?.videos || []).map((video: any) => ({
      ...video,
      thumbnail: video.thumbnail_url,
    })),
    [song]
  );

  // Compute impressions
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

  if (!song) return <div className="container">Song not found.</div>;

  return (
    <main className="container">
      <nav>
        <Link href="/songs" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          ← Back to Songs
        </Link>
      </nav>
      <h1 className="h1">{song.title}</h1>
      <ImpressionsStats
        totalImpressions={totalImpressions}
        impressionsThisWeek={impressionsThisWeek}
      />
      <div className="data-table-container">
        <SongSummary summary={song.video_trend_analysis} />
      </div>
      <VideoTable videos={videos} />
    </main>
  );
} 