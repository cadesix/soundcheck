'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import styles from './Sidebar.module.css';
import { useArtist } from '../context/ArtistContext';
import ArtistDropdown from './ArtistDropdown';

const navItems = [
  { label: 'Home', href: '/', icon: '/icons/home.png' },
  { label: 'Songs', href: '/songs', icon: '/icons/songs.png' },
  { label: 'Clippers', href: '/clippers', icon: '/icons/clippers.png' },
  { label: 'Find Accounts', href: '/find-accounts', icon: '/icons/find-accounts.png' },
];

const SidebarHeaderSkeleton: React.FC = () => (
  <div className={styles.header}>
    <div className={styles.artistDropdownSkeleton}>
      <div className={styles.skeletonCircle} />
    </div>
    <div className={`${styles.logo} title`}>SoundTrack</div>
  </div>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { artists, loading } = useArtist();
  
  return (
    <aside className={styles.sidebar}>
      {/* Header with Artist Dropdown and Logo */}
      {loading ? (
        <SidebarHeaderSkeleton />
      ) : (
        <div className={styles.header}>
          {artists.length > 0 && <ArtistDropdown />}
          <div className={`${styles.logo} title`}>SoundTrack</div>
        </div>
      )}
      
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
                <div className={styles.linkContent}>
                  <Image
                    src={item.icon}
                    alt={`${item.label} icon`}
                    width={24}
                    height={24}
                    className={styles.icon}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 