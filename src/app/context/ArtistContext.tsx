'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface ArtistContextType {
  selectedArtistId: string;
  setSelectedArtistId: (id: string) => void;
  artists: any[];
  setArtists: (artists: any[]) => void;
  loading: boolean;
  error: string | null;
}

const ArtistContext = createContext<ArtistContextType>({
  selectedArtistId: '',
  setSelectedArtistId: () => {},
  artists: [],
  setArtists: () => {},
  loading: true,
  error: null,
});

export const useArtist = () => useContext(ArtistContext);

export function ArtistProvider({ children }: { children: React.ReactNode }) {
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load artists data centrally
  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('artists')
        .select(`
          id,
          name,
          profile_image,
          songs(
            id,
            title,
            cover_url,
            num_creates,
            video_trend_analysis,
            artist_id,
            videos(
              id,
              tiktok_video_id,
              video_url,
              thumbnail_url,
              date_posted,
              num_likes,
              num_views,
              creator_id,
              song_id,
              created_at,
              creator:creators!videos_creator_id_fkey (
                id,
                name,
                profile_url,
                num_followers,
                email,
                date_last_posted,
                image_url
              )
            )
          )
        `);
      
      if (error) {
        console.error('ArtistContext fetch error:', error);
        setError(error.message);
      } else {
        console.log('Raw artist data:', data);
        
        // Debug: Check data integrity
        if (data) {
          data.forEach(artist => {
            console.log(`Artist: ${artist.name} (${artist.id})`);
            artist.songs?.forEach(song => {
              console.log(`  Song: ${song.title} (${song.id}) - artist_id: ${song.artist_id}`);
              song.videos?.forEach(video => {
                console.log(`    Video: ${video.id} - song_id: ${video.song_id}`);
              });
            });
          });
        }
        
        setArtists(data || []);
        // Set default artist if none selected and artists exist
        const storedArtistId = localStorage.getItem('selectedArtistId');
        if (data && data.length > 0) {
          if (storedArtistId && data.find(a => a.id === storedArtistId)) {
            setSelectedArtistId(storedArtistId);
          } else {
            setSelectedArtistId(data[0].id);
          }
        }
      }
      
      setLoading(false);
    };

    fetchArtists();
  }, []);

  // Persist selection in localStorage
  useEffect(() => {
    if (selectedArtistId) {
      localStorage.setItem('selectedArtistId', selectedArtistId);
    }
  }, [selectedArtistId]);

  return (
    <ArtistContext.Provider value={{ 
      selectedArtistId, 
      setSelectedArtistId, 
      artists, 
      setArtists, 
      loading, 
      error 
    }}>
      {children}
    </ArtistContext.Provider>
  );
} 