'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ArtistContextType {
  selectedArtistId: string;
  setSelectedArtistId: (id: string) => void;
  artists: any[];
  setArtists: (artists: any[]) => void;
}

const ArtistContext = createContext<ArtistContextType>({
  selectedArtistId: '',
  setSelectedArtistId: () => {},
  artists: [],
  setArtists: () => {},
});

export const useArtist = () => useContext(ArtistContext);

export function ArtistProvider({ children }: { children: React.ReactNode }) {
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [artists, setArtists] = useState<any[]>([]);

  // Persist selection in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('selectedArtistId');
    if (stored) setSelectedArtistId(stored);
  }, []);
  useEffect(() => {
    if (selectedArtistId) localStorage.setItem('selectedArtistId', selectedArtistId);
  }, [selectedArtistId]);

  return (
    <ArtistContext.Provider value={{ selectedArtistId, setSelectedArtistId, artists, setArtists }}>
      {children}
    </ArtistContext.Provider>
  );
} 