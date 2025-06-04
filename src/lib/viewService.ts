import { supabase } from './supabase';

export async function getCreatorsViews(creatorIds: string[]): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc('get_creators_total_views', {
    creator_ids: creatorIds
  });
  
  if (error) throw error;
  if (!data) return new Map();
  
  return new Map(
    data.map((item: any) => [item.creator_id, item.total_views])
  );
}

export async function getSongsViews(songIds: string[]): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc('get_songs_total_views', {
    song_ids: songIds
  });
  
  if (error) throw error;
  if (!data) return new Map();
  
  return new Map(
    data.map((item: any) => [item.song_id, item.total_views])
  );
} 