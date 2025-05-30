import React from 'react';

const VideosTableSkeleton: React.FC = () => (
  <div style={{ background: '#fff', border: '1.5px solid #ececf1', borderRadius: 10, padding: '1.5rem 2rem', width: '100%', marginBottom: 16 }}>
    <div style={{ height: 24, width: 120, background: '#ececf1', borderRadius: 6, marginBottom: 24 }} />
    {[...Array(4)].map((_, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18 }}>
        <div style={{ width: 54, height: 96, borderRadius: 6, background: '#ececf1' }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: 100, height: 16, background: '#ececf1', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ width: 60, height: 14, background: '#ececf1', borderRadius: 4, marginBottom: 6 }} />
          <div style={{ width: 80, height: 14, background: '#ececf1', borderRadius: 4 }} />
        </div>
        <div style={{ width: 80, height: 18, background: '#ececf1', borderRadius: 4 }} />
      </div>
    ))}
  </div>
);

export default VideosTableSkeleton; 