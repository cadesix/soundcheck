'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useArtist } from '../context/ArtistContext';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Songs', href: '/songs' },
  { label: 'Clippers', href: '/clippers' },
  { label: 'Find Accounts', href: '/find-accounts' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { selectedArtistId, setSelectedArtistId, artists } = useArtist();
  return (
    <aside className={styles.sidebar}>
      <div className={`${styles.logo} title`}>SoundTrack</div>
      <div style={{ width: '100%', marginBottom: 32 }}>
        <label htmlFor="artist-select" className="brand-label" style={{ marginBottom: 8, display: 'block' }}>Artist:</label>
        <select
          id="artist-select"
          className="brand-dropdown"
          value={selectedArtistId}
          onChange={e => setSelectedArtistId(e.target.value)}
          style={{ width: '100%' }}
        >
          {artists.map(artist => (
            <option key={artist.id} value={artist.id}>{artist.name}</option>
          ))}
        </select>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map(item => (
            <li key={item.href} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.link} h2${
                  (item.href === '/songs' && pathname.startsWith('/songs'))
                    ? ' ' + styles.active
                    : pathname === item.href && item.href !== '/songs'
                      ? ' ' + styles.active
                      : ''
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 