'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import SimilarCreatorsTable from '../components/SimilarCreatorsTable';
import { useArtist } from '../context/ArtistContext';

export default function FindAccountsPage() {
  const { selectedArtistId } = useArtist();
  const [similarCreators, setSimilarCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarCreators = async () => {
      setLoading(true);
      if (!selectedArtistId) {
        setSimilarCreators([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .rpc('get_similar_creators_for_artist', { artist_id: selectedArtistId });
      if (error) {
        setSimilarCreators([]);
        setLoading(false);
        return;
      }
      setSimilarCreators((data || []).map((row: any) => ({
        id: row.creator_id + '-' + row.similar_artist_id,
        creator_name: row.creator_name,
        creator_url: row.creator_url,
        similar_artist_name: row.similar_artist_name,
      })));
      setLoading(false);
    };
    fetchSimilarCreators();
  }, [selectedArtistId]);

  return (
    <main className="container">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <SimilarCreatorsTable similarCreators={similarCreators} />
      )}
    </main>
  );
} 