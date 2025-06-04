'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useArtist } from '../context/ArtistContext';
import styles from './ArtistDropdown.module.css';

const ArtistDropdownSkeleton: React.FC = () => (
  <div className={styles.dropdown}>
    <div className={styles.skeletonTrigger}>
      <div className={styles.skeletonCircle} />
    </div>
  </div>
);

const ArtistDropdown: React.FC = () => {
  const { selectedArtistId, setSelectedArtistId, artists, loading, error } = useArtist();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedArtist = artists.find(a => a.id === selectedArtistId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtistId(artistId);
    setIsOpen(false);
  };

  // Show skeleton while loading
  if (loading) {
    return <ArtistDropdownSkeleton />;
  }

  // Show error state (could be customized further)
  if (error || !selectedArtist) {
    return <ArtistDropdownSkeleton />;
  }

  return (
    <div ref={dropdownRef} className={styles.dropdown}>
      {/* Trigger Button */}
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Show chevron on hover, artist image otherwise */}
        {isHovered ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.chevron}
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        ) : selectedArtist.profile_image ? (
          <img
            src={selectedArtist.profile_image}
            alt={selectedArtist.name}
            className={styles.artistImage}
            onError={(e) => {
              // Hide image and show initials if image fails to load
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextSibling) {
                (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        {/* Fallback to initials - shown by default if no profile_image or if image fails */}
        <div 
          className={styles.artistInitials}
          style={{ display: selectedArtist.profile_image ? 'none' : 'flex' }}
        >
          {selectedArtist.name.charAt(0).toUpperCase()}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={styles.menu}>
          {artists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => handleArtistSelect(artist.id)}
              className={`${styles.menuItem} ${artist.id === selectedArtistId ? styles.selected : ''}`}
            >
              {/* Artist Image */}
              {artist.profile_image ? (
                <img
                  src={artist.profile_image}
                  alt={artist.name}
                  className={styles.menuItemImage}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              
              {/* Fallback to initials */}
              <div 
                className={styles.menuItemInitials}
                style={{ display: artist.profile_image ? 'none' : 'flex' }}
              >
                {artist.name.charAt(0).toUpperCase()}
              </div>
              
              {/* Artist Name */}
              <span>{artist.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistDropdown; 