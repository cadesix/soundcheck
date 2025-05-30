'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import TopCreatorsTable from './components/TopCreatorsTable'
import SongSummary from './components/SongSummary'
import { useArtist } from './context/ArtistContext'
import VideoTable from './components/VideoTable'
import ImpressionsStats from './components/ImpressionsStats'
import Table from './components/Table'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const { selectedArtistId, setSelectedArtistId, artists, setArtists } = useArtist();
  const [selectedSongId, setSelectedSongId] = useState<string>('all')
  const [similarCreators, setSimilarCreators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch artists once and set in context
  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('artists')
        .select(`
          id,
          name,
          profile_url,
          songs(
            id,
            title,
            cover_url,
            num_creates,
            video_trend_analysis,
            videos(
              id,
              tiktok_video_id,
              video_url,
              thumbnail_url,
              date_posted,
              num_likes,
              num_views,
              creator_id,
              created_at,
              creator:creators!videos_creator_id_fkey (
                id,
                name,
                profile_url,
                num_followers,
                email,
                date_last_posted
              )
            )
          )
        `)
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setArtists(data || [])
      // Set default artist and song (all songs)
      if (data && data.length > 0 && !selectedArtistId) {
        setSelectedArtistId(data[0].id)
        setSelectedSongId('all')
      }
      setLoading(false)
    }
    if (artists.length === 0) {
      fetchArtists()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      }))
    );
  } else {
    selectedSong = songs.find((s: any) => s.id === selectedSongId)
    videos = (selectedSong?.videos || []).map((video: any) => ({
      ...video,
      thumbnail: video.thumbnail_url,
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
    }))
    .sort((a, b) => (b.num_followers || 0) - (a.num_followers || 0))
    .slice(0, 10); // Top 10 creators

  return (
    <main className="container">
      <ImpressionsStats
        totalImpressions={totalImpressions}
        impressionsThisWeek={impressionsThisWeek}
      />
      <TopCreatorsTable topCreators={allCreators} />
      {selectedSongId !== 'all' && selectedSong && (
        <SongSummary summary={selectedSong.video_trend_analysis} />
      )}
      <VideoTable videos={videos} />
    </main>
  )
}
