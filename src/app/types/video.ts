export interface Video {
  id: string;
  video_id: string;
  web_video_url: string;
  overview: string | null;
  date_posted: string;
  creator_id: string;
  brand_id: string;
  thumbnail?: string | null;
  num_views?: number | null;
  num_likes?: number | null;
  transcript?: string | null;
  creator?: {
    id: string;
    name?: string;
    profile_url?: string;
  };
} 