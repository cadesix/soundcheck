import React from 'react';

const CreatorsTableSkeleton: React.FC = () => (
  <div style={{ background: '#fff', border: '1.5px solid #ececf1', borderRadius: 10, padding: '1.5rem 2rem', width: '100%', marginBottom: 16 }}>
    <div style={{ height: 24, width: 180, background: '#ececf1', borderRadius: 6, marginBottom: 24 }} />
    {[...Array(4)].map((_, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ececf1' }} />
        <div style={{ width: 120, height: 18, background: '#ececf1', borderRadius: 4 }} />
        <div style={{ width: 60, height: 18, background: '#ececf1', borderRadius: 4, marginLeft: 16 }} />
        <div style={{ width: 90, height: 18, background: '#ececf1', borderRadius: 4, marginLeft: 16 }} />
      </div>
    ))}
  </div>
);

export default CreatorsTableSkeleton; 