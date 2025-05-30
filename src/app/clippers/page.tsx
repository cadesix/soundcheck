"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import InputModal from "../components/InputModal";
import ImpressionsStats from "../components/ImpressionsStats";
import VideoTable from "../components/VideoTable";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ClippersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creators, setCreators] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [videosByCreator, setVideosByCreator] = useState<Record<string, any[]>>({});
  const [videosLoading, setVideosLoading] = useState<Record<string, boolean>>({});

  const fetchCreators = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("creators")
      .select("id, name, profile_url")
      .eq("is_tracked", true);
    if (!error) setCreators(data || []);
    setFetching(false);
  };

  // Fetch videos for each creator
  const fetchVideosForCreators = async (creatorsList: any[]) => {
    const newVideosByCreator: Record<string, any[]> = {};
    const newVideosLoading: Record<string, boolean> = {};
    await Promise.all(
      creatorsList.map(async (creator) => {
        newVideosLoading[creator.id] = true;
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .eq("creator_id", creator.id);
        newVideosByCreator[creator.id] = data || [];
        newVideosLoading[creator.id] = false;
      })
    );
    setVideosByCreator(newVideosByCreator);
    setVideosLoading(newVideosLoading);
  };

  useEffect(() => {
    fetchCreators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (creators.length > 0) {
      fetchVideosForCreators(creators);
    } else {
      setVideosByCreator({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creators]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("user_input_links")
      .insert([{ url: inputValue, type: "tiktok_link" }]);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setModalOpen(false);
      setInputValue("");
      fetchCreators();
    }
  };

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
    Object.values(videosByCreator).forEach((videos: any[]) => {
      totalImpressions += videos.reduce((sum, v) => sum + (v.num_views || 0), 0);
      impressionsThisWeek += videos.reduce(
        (sum, v) =>
          v.date_posted && new Date(v.date_posted) >= oneWeekAgo
            ? sum + (v.num_views || 0)
            : sum,
        0
      );
    });
    return { totalImpressions, impressionsThisWeek };
  };

  const { totalImpressions, impressionsThisWeek } = getAggregateImpressions();

  return (
    <main className="container">
      <h1 className="h1" style={{ marginBottom: 24 }}>Clippers</h1>
      <button
        onClick={handleOpen}
        style={{ padding: "10px 24px", borderRadius: 8, background: "#2563eb", color: "#fff", fontWeight: 500, border: "none", cursor: "pointer", fontSize: 16 }}
      >
        Add TikTok Creator
      </button>
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
      <div style={{ marginTop: 40 }}>
        <ImpressionsStats
          totalImpressions={totalImpressions}
          impressionsThisWeek={impressionsThisWeek}
        />
        <h2 className="h2" style={{ margin: '32px 0 16px 0' }}>Tracked Creators</h2>
        {fetching ? (
          <div className="loading">Loading creators...</div>
        ) : creators.length === 0 ? (
          <div>No tracked creators found.</div>
        ) : (
          <table style={{ width: '100%', marginBottom: 40, background: '#fff', border: '1.5px solid #ececf1', borderRadius: 10 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 12 }}>Name</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Profile</th>
                <th style={{ textAlign: 'left', padding: 12 }}># Videos</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Total Impressions</th>
              </tr>
            </thead>
            <tbody>
              {creators.map(creator => {
                const videos = videosByCreator[creator.id] || [];
                const creatorImpressions = videos.reduce((sum, v) => sum + (v.num_views || 0), 0);
                return (
                  <tr key={creator.id}>
                    <td style={{ padding: 12 }}>{creator.name}</td>
                    <td style={{ padding: 12 }}>
                      <a href={creator.profile_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 500 }}>Profile</a>
                    </td>
                    <td style={{ padding: 12 }}>{videos.length}</td>
                    <td style={{ padding: 12 }}>{creatorImpressions.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {creators.map(creator => {
          const videos = videosByCreator[creator.id] || [];
          return (
            <div key={creator.id} style={{ marginBottom: 48 }}>
              {videosLoading[creator.id] ? (
                <div className="loading">Loading videos...</div>
              ) : (
                <VideoTable videos={videos} />
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
} 