"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useArtist } from "../context/ArtistContext";
import InputModal from "../components/InputModal";
import ImpressionsStats from "../components/ImpressionsStats";
import VideoTable from "../components/VideoTable";
import TrackedCreatorsTable from '../components/TrackedCreatorsTable';
import TertiaryButton from '../components/TertiaryButton';
import { ResourceState } from '../types/resource';
import ResourceWrapper from '../components/common/ResourceWrapper';
import CreatorsTableSkeleton from '../components/common/CreatorsTableSkeleton';
import VideosTableSkeleton from '../components/common/VideosTableSkeleton';
import ImpressionsStatsSkeleton from '../components/common/ImpressionsStatsSkeleton';

export default function ClippersPage() {
  const { selectedArtistId, loading: artistLoading, error: artistError } = useArtist();
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatorsResource, setCreatorsResource] = useState<ResourceState<any[]>>({ status: 'loading' });
  const [videosResource, setVideosResource] = useState<ResourceState<any[]>>({ status: 'loading' });
  const [pendingLinks, setPendingLinks] = useState<string[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCreators = async () => {
    if (!selectedArtistId) {
      setCreatorsResource({ status: 'empty' });
      return;
    }

    setCreatorsResource({ status: 'loading' });
    const { data, error } = await supabase
      .from("artist_clippers")
      .select(`
        id,
        creator:creators!artist_clippers_creator_id_fkey (
          id,
          name,
          profile_url,
          image_url
        )
      `)
      .eq("artist_id", selectedArtistId);
    
    if (error) {
      setCreatorsResource({ status: 'error', error: error.message });
    } else if (!data || data.length === 0) {
      setCreatorsResource({ status: 'empty' });
    } else {
      // Transform the data to match the expected format
      const creators = data.map((item: any) => item.creator);
      setCreatorsResource({ status: 'loaded', data: creators });
    }
  };

  const fetchVideosForCreators = async (creatorsList: any[]) => {
    setVideosResource({ status: 'loading' });
    const allVideos: any[] = [];
    await Promise.all(
      creatorsList.map(async (creator) => {
        const { data, error } = await supabase
          .from("videos")
          .select("*, creator:creator_id(id, name, profile_url), thumbnail_url")
          .eq("creator_id", creator.id);
        if (data) {
          allVideos.push(...data.map((video: any) => ({
            ...video,
            thumbnail: video.thumbnail_url,
            web_video_url: video.video_url,
            creator: video.creator,
          })));
        }
      })
    );
    if (allVideos.length === 0) {
      setVideosResource({ status: 'empty' });
    } else {
      setVideosResource({ status: 'loaded', data: allVideos });
    }
  };

  useEffect(() => {
    fetchCreators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtistId]);

  useEffect(() => {
    if (creatorsResource.status === 'loaded') {
      fetchVideosForCreators(creatorsResource.data);
    } else if (creatorsResource.status === 'empty' || creatorsResource.status === 'error') {
      setVideosResource({ status: 'empty' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorsResource]);

  const handleSubmit = async () => {
    if (!selectedArtistId) {
      setError("Please select an artist first");
      return;
    }

    setLoading(true);
    setError(null);
    setPendingLinks(prev => [...prev, inputValue]);
    
    const { error } = await supabase
      .from("user_input_links")
      .insert([{ 
        url: inputValue, 
        type: "tiktok_link",
        artist_id: selectedArtistId 
      }]);
    
    setLoading(false);
    if (error) {
      setError(error.message);
      setPendingLinks(prev => prev.filter(link => link !== inputValue));
    } else {
      setModalOpen(false);
      setInputValue("");
    }
  };

  // Polling logic for pending links
  useEffect(() => {
    if (pendingLinks.length === 0 || !selectedArtistId) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      // Check if any pending links have been processed into creators
      const { data: creatorsData } = await supabase
        .from('creators')
        .select('id, profile_url')
        .in('profile_url', pendingLinks);
      
      if (creatorsData && creatorsData.length > 0) {
        // Check if these creators are already linked to the current artist
        const { data: existingLinks } = await supabase
          .from('artist_clippers')
          .select('creator_id')
          .eq('artist_id', selectedArtistId)
          .in('creator_id', creatorsData.map(c => c.id));
        
        const existingCreatorIds = new Set(existingLinks?.map(link => link.creator_id) || []);
        
        // Create links for new creators
        const newCreators = creatorsData.filter(c => !existingCreatorIds.has(c.id));
        if (newCreators.length > 0) {
          await supabase
            .from('artist_clippers')
            .insert(
              newCreators.map(creator => ({
                artist_id: selectedArtistId,
                creator_id: creator.id,
                added_by: 'manual_input'
              }))
            );
        }
        
        // Remove processed links from pending
        const processedUrls = creatorsData.map(c => c.profile_url);
        setPendingLinks(prev => prev.filter(link => !processedUrls.includes(link)));
        
        // Refresh creators/videos data
        fetchCreators();
      }
    }, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pendingLinks, selectedArtistId]);

  const handleOpen = () => {
    setModalOpen(true);
    setError(null);
    setInputValue("");
  };

  const handleClose = () => {
    setModalOpen(false);
    setError(null);
    setInputValue("");
  };

  // Calculate video counts and impressions per creator
  const getCreatorStats = (creatorId: string) => {
    if (videosResource.status !== 'loaded') return { num_videos: 0, total_impressions: 0 };
    
    const creatorVideos = videosResource.data.filter((v: any) => v.creator_id === creatorId);
    const num_videos = creatorVideos.length;
    const total_impressions = creatorVideos.reduce((sum: number, v: any) => sum + (v.num_views || 0), 0);
    
    return { num_videos, total_impressions };
  };

  // Aggregate impressions for all tracked creators
  const getAggregateImpressions = () => {
    let totalImpressions = 0;
    let impressionsThisWeek = 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (videosResource.status === 'loaded') {
      videosResource.data.forEach((v: any) => {
        totalImpressions += v.num_views || 0;
        if (v.date_posted && new Date(v.date_posted) >= oneWeekAgo) {
          impressionsThisWeek += v.num_views || 0;
        }
      });
    }
    return { totalImpressions, impressionsThisWeek };
  };

  const { totalImpressions, impressionsThisWeek } = getAggregateImpressions();

  if (artistLoading) {
    return (
      <main className="container">
        <h1 className="h1" style={{ marginBottom: 24 }}>Clippers</h1>
        <div className="loading">Loading artists...</div>
      </main>
    );
  }

  if (artistError) {
    return (
      <main className="container">
        <h1 className="h1" style={{ marginBottom: 24 }}>Clippers</h1>
        <div className="error">Error loading artists: {artistError}</div>
      </main>
    );
  }

  if (!selectedArtistId) {
    return (
      <main className="container">
        <h1 className="h1" style={{ marginBottom: 24 }}>Clippers</h1>
        <div className="error">Please select an artist to view clippers.</div>
      </main>
    );
  }

  return (
    <main className="container">
      <InputModal
        open={modalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        value={inputValue}
        onChange={setInputValue}
        loading={loading}
        error={error}
        label="Submit a TikTok Creator URL"
        placeholder="Paste TikTok creator URL here..."
      />
      
      {videosResource.status === 'loaded' ? (
        <ImpressionsStats
          totalImpressions={totalImpressions}
          impressionsThisWeek={impressionsThisWeek}
        />
      ) : (
        <ImpressionsStatsSkeleton />
      )}
      
      <ResourceWrapper
        resource={creatorsResource}
        loading={<CreatorsTableSkeleton />}
        empty={<div>No tracked creators found for this artist.</div>}
        error={<div className="error">Failed to load creators.</div>}
      >{(creators) => 
        <TrackedCreatorsTable
          creators={[
            ...creators.map((creator: any) => {
              const stats = getCreatorStats(creator.id);
              return {
                id: creator.id,
                name: creator.name,
                profile_url: creator.profile_url,
                image_url: creator.image_url || null,
                num_videos: stats.num_videos,
                total_impressions: stats.total_impressions,
              };
            }),
            ...pendingLinks.map(link => ({
              id: link,
              name: `Processing…`,
              profile_url: link,
              image_url: null,
              num_videos: 0,
              total_impressions: 0,
              isPending: true,
            }))
          ]}
        />
      }
      </ResourceWrapper>
      
      <TertiaryButton onClick={handleOpen}>+ Add New</TertiaryButton>
      
      <ResourceWrapper
        resource={videosResource}
        loading={<VideosTableSkeleton />}
        empty={<div>No videos found.</div>}
        error={<div className="error">Failed to load videos.</div>}
      >{(videos) => <VideoTable videos={videos} />}
      </ResourceWrapper>
    </main>
  );
} 