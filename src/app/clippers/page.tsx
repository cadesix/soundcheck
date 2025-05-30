"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ClippersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatorsResource, setCreatorsResource] = useState<ResourceState<any[]>>({ status: 'loading' });
  const [videosResource, setVideosResource] = useState<ResourceState<any[]>>({ status: 'loading' });
  const [pendingLinks, setPendingLinks] = useState<string[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCreators = async () => {
    setCreatorsResource({ status: 'loading' });
    const { data, error } = await supabase
      .from("creators")
      .select("id, name, profile_url, image_url")
      .eq("is_tracked", true);
    if (error) {
      setCreatorsResource({ status: 'error', error: error.message });
    } else if (!data || data.length === 0) {
      setCreatorsResource({ status: 'empty' });
    } else {
      setCreatorsResource({ status: 'loaded', data });
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
  }, []);

  useEffect(() => {
    if (creatorsResource.status === 'loaded') {
      fetchVideosForCreators(creatorsResource.data);
    } else if (creatorsResource.status === 'empty' || creatorsResource.status === 'error') {
      setVideosResource({ status: 'empty' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorsResource]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setPendingLinks(prev => [...prev, inputValue]);
    const { error } = await supabase
      .from("user_input_links")
      .insert([{ url: inputValue, type: "tiktok_link" }]);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setModalOpen(false);
      setInputValue("");
      // fetchCreators(); // Don't fetch immediately, wait for polling
    }
  };

  // Polling logic for pending links
  useEffect(() => {
    if (pendingLinks.length === 0) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      // Only poll for links in pendingLinks
      const { data: creatorsData } = await supabase
        .from('creators')
        .select('*')
        .in('profile_url', pendingLinks);
      if (creatorsData && creatorsData.length > 0) {
        setPendingLinks(prev => prev.filter(link => !creatorsData.some(c => c.profile_url === link)));
        // Refresh creators/videos data
        fetchCreators();
      }
    }, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pendingLinks]);

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

  return (
    <main className="container">
      <h1 className="h1" style={{ marginBottom: 24 }}>Clippers</h1>
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
      <div>
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
          empty={<div>No tracked creators found.</div>}
          error={<div className="error">Failed to load creators.</div>}
        >{(creators) => <>
          <TrackedCreatorsTable
            creators={[
              ...creators.map((creator: any) => {
                // videosByCreator is not used anymore, so just pass 0 for videos
                return {
                  id: creator.id,
                  name: creator.name,
                  profile_url: creator.profile_url,
                  image_url: creator.image_url || null,
                  num_videos: 0,
                  total_impressions: 0,
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
          <TertiaryButton onClick={handleOpen}>+ Add New</TertiaryButton>
        </>}
        </ResourceWrapper>
        <ResourceWrapper
          resource={videosResource}
          loading={<VideosTableSkeleton />}
          empty={<div>No videos found.</div>}
          error={<div className="error">Failed to load videos.</div>}
        >{(videos) => <VideoTable videos={videos} />}
        </ResourceWrapper>
      </div>
    </main>
  );
} 