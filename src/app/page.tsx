'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import TopCreatorsTable from './components/TopCreatorsTable'
import SongSummary from './components/SongSummary'
import { useArtist } from './context/ArtistContext'
import VideoTable from './components/VideoTable'
import ImpressionsStats from './components/ImpressionsStats'
import Table from './components/Table'

export default function Home() {
  const { selectedArtistId, artists, loading, error } = useArtist();
  const [selectedSongId, setSelectedSongId] = useState<string>('all')
  const [similarCreators, setSimilarCreators] = useState<any[]>([])

  // Fetch similar creators using the Supabase RPC function
  useEffect(() => {
    const fetchSimilarCreators = async () => {
      if (!selectedArtistId) {
        setSimilarCreators([])
        return
      }
      const { data, error } = await supabase
        .rpc('get_similar_creators_for_artist', { artist_id: selectedArtistId })
      if (error) {
        setSimilarCreators([])
        return
      }
      setSimilarCreators((data || []).map((row: any) => ({
        id: row.creator_id + '-' + row.similar_artist_id,
        creator_name: row.creator_name,
        creator_url: row.creator_url,
        similar_artist_name: row.similar_artist_name,
      })))
    }
    fetchSimilarCreators()
  }, [selectedArtistId])

  // Update selectedSongId when artist changes
  useEffect(() => {
    const artist = artists.find(a => a.id === selectedArtistId)
    if (artist && artist.songs && artist.songs.length > 0) {
      setSelectedSongId('all')
    } else {
      setSelectedSongId('all')
    }
  }, [selectedArtistId, artists])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>

  const selectedArtist = artists.find(a => a.id === selectedArtistId)
  const songs = selectedArtist?.songs || []
  // Aggregate videos and creators for all songs if 'all' is selected
  let videos: any[] = []
  let selectedSong: any = null;
  if (selectedSongId === 'all') {
    videos = songs.flatMap((song: any) =>
      (song.videos || []).map((video: any) => ({
        ...video,
        thumbnail: video.thumbnail_url,
        web_video_url: video.video_url,
      }))
    );
  } else {
    selectedSong = songs.find((s: any) => s.id === selectedSongId)
    videos = (selectedSong?.videos || []).map((video: any) => ({
      ...video,
      thumbnail: video.thumbnail_url,
      web_video_url: video.video_url,
    }));
  }

  // Calculate impressions and top creators for the selected song
  const totalImpressions = videos.reduce((sum: number, v: any) => sum + (v.num_views || 0), 0);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const impressionsThisWeek = videos.reduce(
    (sum: number, v: any) =>
      v.date_posted && new Date(v.date_posted) >= oneWeekAgo
        ? sum + (v.num_views || 0)
        : sum,
    0
  );

  // Gather all unique creators from these videos
  const creatorsMap: Record<string, any> = {};
  videos.forEach((video: any) => {
    if (video.creator && video.creator.id) {
      creatorsMap[video.creator.id] = video.creator;
    }
  });
  const allCreators = Object.values(creatorsMap)
    .map((c: any) => ({
      id: c.id,
      creator_name: c.name,
      creator_url: c.profile_url,
      email: c.email,
      num_followers: c.num_followers,
      image_url: c.image_url,
    }))
    .sort((a, b) => (b.num_followers || 0) - (a.num_followers || 0))
    .slice(0, 10); // Top 10 creators

  return (
    <main className="container">
      <ImpressionsStats
        totalImpressions={totalImpressions}
        impressionsThisWeek={impressionsThisWeek}
      />
      <VideoTable videos={videos} />
      <TopCreatorsTable topCreators={allCreators} />
      {selectedSongId !== 'all' && selectedSong && (
        <SongSummary summary={selectedSong.video_trend_analysis} />
      )}
    </main>
  )
}
