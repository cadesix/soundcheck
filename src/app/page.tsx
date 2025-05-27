'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Restaurant {
  id: string
  name: string
}
interface Video {
  id: string
  video_id: string
  web_video_url: string
  overview: string | null
  date_posted: string
  creator_id: string
  restaurant_id: string
  thumbnail?: string | null
}
interface Creator {
  id: string
  creator_name: string
  creator_url: string
  email: string | null
}
interface Comment {
  id: string
  video_id: string
  content: string
  created_at: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [creators, setCreators] = useState<Record<string, Creator>>({})
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all restaurants on mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('restaurants').select('*').order('name')
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setRestaurants(data || [])
      if (data && data.length > 0) setSelectedRestaurant(data[0])
      setLoading(false)
    }
    fetchRestaurants()
  }, [])

  // Fetch videos, creators, comments for selected restaurant
  useEffect(() => {
    if (!selectedRestaurant) return
    setLoading(true)
    setError(null)
    const fetchData = async () => {
      // Fetch videos for restaurant
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('restaurant_id', selectedRestaurant.id)
        .order('date_posted', { ascending: false })
      if (videosError) {
        setError(videosError.message)
        setLoading(false)
        return
      }
      setVideos(videosData || [])

      // Fetch all creators for these videos
      const creatorIds = [...new Set((videosData || []).map(v => v.creator_id))]
      let creatorsMap: Record<string, Creator> = {}
      if (creatorIds.length > 0) {
        const { data: creatorsRaw, error: creatorsError } = await supabase
          .from('creators')
          .select('*')
          .in('id', creatorIds)
        if (creatorsError) {
          setError(creatorsError.message)
          setLoading(false)
          return
        }
        for (const c of creatorsRaw || []) {
          creatorsMap[c.id] = c
        }
      }
      setCreators(creatorsMap)

      // Fetch comments for all videos
      let commentsData: Comment[] = []
      if ((videosData || []).length > 0) {
        const videoIds = (videosData || []).map(v => v.id)
        const { data: commentsRaw, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .in('video_id', videoIds)
        if (commentsError) {
          setError(commentsError.message)
          setLoading(false)
          return
        }
        commentsData = commentsRaw || []
      }
      setComments(commentsData)
      setLoading(false)
    }
    fetchData()
  }, [selectedRestaurant])

  if (loading) {
    return <div className="loading">Loading...</div>
  }
  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <main className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '2.5rem', color: '#18181b' }}>
        <span style={{ color: '#18181b' }}>Restaurant Videos</span>
      </h1>
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label htmlFor="restaurant-select" style={{ fontWeight: 600, fontSize: '1.1em', color: '#18181b' }}>Restaurant:</label>
        <select
          id="restaurant-select"
          value={selectedRestaurant?.id || ''}
          onChange={e => {
            const rest = restaurants.find(r => r.id === e.target.value)
            setSelectedRestaurant(rest || null)
          }}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: 6,
            border: '1px solid #ececf1',
            background: '#f8fafc',
            fontSize: '1em',
            color: '#18181b',
            fontWeight: 500,
            outline: 'none',
            boxShadow: 'none',
            transition: 'border 0.2s',
          }}
        >
          {restaurants.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      {videos.length === 0 ? (
        <div style={{ color: '#888', fontSize: '1.1em', textAlign: 'center', marginTop: '4rem' }}>No videos found.</div>
      ) : (
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {videos.map(video => {
            const creator = creators[video.creator_id]
            const videoComments = comments.filter(c => c.video_id === video.id)
            return (
              <li key={video.id} style={{
                marginBottom: '2.5rem',
                borderRadius: 8,
                background: '#fff',
                border: '1.5px solid #ececf1',
                padding: '2rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '2.5rem',
                transition: 'border 0.2s',
                position: 'relative',
              }}>
                {video.thumbnail && (
                  <img src={video.thumbnail} alt="thumbnail" style={{ width: 200, height: 355, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #ececf1', background: '#f3f4f6', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ fontWeight: 400, fontSize: '1.18em', color: '#18181b', letterSpacing: '-0.01em' }}>
                    Video by <span style={{ fontWeight: 700 }}>{creator ? creator.creator_name : 'Unknown'}</span>
                  </div>
                  <div style={{ fontSize: '1em', color: '#18181b', marginTop: '-0.2em', marginBottom: '0.2em', fontWeight: 500 }}>
                    {new Date(video.date_posted).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                    <button
                      onClick={() => window.open(creator?.creator_url, '_blank')}
                      style={{
                        padding: '0.35rem 1rem',
                        borderRadius: 5,
                        border: 'none',
                        background: '#18181b',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.98em',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        transition: 'background 0.2s',
                        outline: 'none',
                      }}
                      disabled={!creator?.creator_url}
                    >
                      View Creator
                    </button>
                    <button
                      onClick={() => window.open(video.web_video_url, '_blank')}
                      style={{
                        padding: '0.35rem 1rem',
                        borderRadius: 5,
                        border: 'none',
                        background: '#18181b',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.98em',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        transition: 'background 0.2s',
                        outline: 'none',
                      }}
                    >
                      View Video
                    </button>
                  </div>
                  <div style={{ marginTop: '0.5rem', background: '#f8fafc', borderRadius: 6, padding: '1rem 1.2rem', boxShadow: 'none', border: '1.5px solid #ececf1' }}>
                    <strong style={{ color: '#18181b', fontWeight: 600, fontSize: '1.05em' }}>Comments</strong>
                    {videoComments.length === 0 ? (
                      <div style={{ color: '#aaa', fontSize: '0.98em', marginTop: '0.5em' }}>No comments.</div>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: '1.2em', marginTop: '0.5em' }}>
                        {videoComments.map(comment => (
                          <li key={comment.id} style={{ color: '#555', fontSize: '1em', marginBottom: '0.3em', lineHeight: 1.5 }}>
                            {comment.content}
                            <span style={{ fontSize: '0.85em', color: '#aaa', marginLeft: '0.5em' }}>
                              ({new Date(comment.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
