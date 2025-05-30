'use client';
import { useState, useMemo } from 'react';
import { useArtist } from '../context/ArtistContext';
import SongSummary from '../components/SongSummary';
import VideoTable from '../components/VideoTable';
import ImpressionsStats from '../components/ImpressionsStats';
import SongsTable, { SongRow } from '../components/SongsTable';

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


  const songsTableRows: SongRow[] = songs.map((song: any) => ({
    id: song.id,
    title: song.title,
    cover_url: song.cover_url,
    num_videos: (song.videos || []).length,
  }));

  return (
    <main className="container">
      <SongsTable songs={songsTableRows} />
    </main>
  );
} 