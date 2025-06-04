'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useArtist } from '../context/ArtistContext';
import ArtistDropdown from './ArtistDropdown';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Songs', href: '/songs' },
  { label: 'Clippers', href: '/clippers' },
  { label: 'Find Accounts', href: '/find-accounts' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { artists } = useArtist();
  
  return (
    <aside className={styles.sidebar}>
      {/* Header with Artist Dropdown and Logo */}
      <div className={styles.header}>
        {artists.length > 0 && <ArtistDropdown />}
        <div className={`${styles.logo} title`}>SoundTrack</div>
      </div>
      
      {/* Navigation */}
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