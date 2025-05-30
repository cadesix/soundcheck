export interface Creator {
  id: string;
  creator_name: string;
  creator_url: string;
  email?: string | null;
  num_followers?: number | null;
  image_url?: string | null;
}

export interface TrackedCreator {
  id: string;
  name: string;
  profile_url: string;
  image_url?: string | null;
  num_videos: number;
  total_impressions: number;
}

export interface SimilarCreator {
  id: string;
  creator_name: string;
  creator_url?: string | null;
  similar_artist_name: string;
  image_url?: string | null;
} 