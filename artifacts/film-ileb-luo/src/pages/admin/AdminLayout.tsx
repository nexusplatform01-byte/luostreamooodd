import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useApp } from '../../context/AppContext';
import {
  DashboardIcon, MovieIcon, SeriesIcon, EpisodeIcon, LiveIcon, UsersIcon,
  SubscriptionIcon, WalletIcon, SettingsIcon, SEOIcon, BackIcon, LogoutIcon,
} from '../../components/Icons';

function CarouselIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M8 12l4-4 4 4"/>
      <circle cx="5" cy="12" r="1" fill={color}/>
      <circle cx="19" cy="12" r="1" fill={color}/>
    </svg>
  );
}

const navSections = [
  {
    title: 'OVERVIEW',
    items: [{ id: 'dashboard', label: 'DASHBOARD', Icon: DashboardIcon, path: '/admin' }],
  },
  {
    title: 'CONTENT',
    items: [
      { id: 'carousel', label: 'CAROUSEL', Icon: CarouselIcon, path: '/admin/carousel' },
      { id: 'movies', label: 'MOVIES', Icon: MovieIcon, path: '/admin/movies' },
      { id: 'series', label: 'TV SERIES', Icon: SeriesIcon, path: '/admin/series' },
      { id: 'episodes', label: 'EPISODES', Icon: EpisodeIcon, path: '/admin/episodes' },
      { id: 'live', label: 'LIVE CHANNELS', Icon: LiveIcon, path: '/admin/live' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { id: 'users', label: 'USERS', Icon: UsersIcon, path: '/admin/users' },
      { id: 'subscriptions', label: 'SUBSCRIPTIONS', Icon: SubscriptionIcon, path: '/admin/subscriptions' },
      { id: 'wallet', label: 'WALLET', Icon: WalletIcon, path: '/admin/wallet' },
    ],
  },
  {
    title: 'CONFIGURATION',
    items: [
      { id: 'settings', label: 'SETTINGS', Icon: SettingsIcon, path: '/admin/settings' },
      { id: 'seo', label: 'SEO', Icon: SEOIcon, path: '/admin/seo' },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div style={{ padding: collapsed ? '14px 12px' : '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 12, fontWeight: 900, letterSpacing: 1, whiteSpace: 'nowrap' }}>
            <span style={{ color: '#e50914' }}>FILM ILEB</span>
            <span style={{ color: '#fff' }}> LUO</span>
          </div>
        )}
        <button onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
          style={{ marginLeft: collapsed ? 0 : 'auto', background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {collapsed ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div style={{ margin: '10px 12px', background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.15)', borderRadius: 8, padding: '7px 10px', flexShrink: 0 }}>
          <div style={{ color: '#e50914', fontSize: 9, fontWeight: 700, letterSpacing: 1.5 }}>ADMIN PANEL</div>
          <div style={{ color: '#555', fontSize: 10, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'ADMINISTRATOR'}</div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', padding: '8px 0' }}>
        {navSections.map(sec => (
          <div key={sec.title}>
            {!collapsed && <div style={{ padding: '8px 16px 4px', color: '#333', fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>{sec.title}</div>}
            {sec.items.map(item => {
              const isActive = location === item.path || (item.path !== '/admin' && location.startsWith(item.path));
              return (
                <Link key={item.id} href={item.path}
                  onClick={() => setMobileOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '11px 18px' : '10px 16px', color: isActive ? '#fff' : '#555', background: isActive ? 'rgba(229,9,20,0.1)' : 'transparent', borderLeft: isActive ? '2px solid #e50914' : '2px solid transparent', textDecoration: 'none', fontSize: 11, fontWeight: isActive ? 700 : 400, letterSpacing: 1, transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden' }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <item.Icon size={15} color={isActive ? '#e50914' : '#444'} />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '6px 0', flexShrink: 0 }}>
        <Link href="/" onClick={() => setMobileOpen(false)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#444', textDecoration: 'none', fontSize: 11, letterSpacing: 1, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
          <BackIcon size={15} color="currentColor" />
          {!collapsed && 'BACK TO SITE'}
        </Link>
        <button onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: 1, width: '100%', transition: 'color 0.15s', fontFamily: 'Arial, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#e50914')}
          onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
          <LogoutIcon size={15} color="currentColor" />
          {!collapsed && 'LOG OUT'}
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .admin-desktop-sidebar { display: none !important; }
          .admin-mobile-header { display: flex !important; }
          .admin-main-content { margin-left: 0 !important; }
          .admin-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .admin-form-grid { grid-template-columns: 1fr !important; }
          .admin-form-full { grid-column: 1 / -1 !important; }
        }
        @media (min-width: 769px) {
          .admin-mobile-header { display: none !important; }
          .admin-mobile-drawer { display: none !important; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0d0f', fontFamily: 'Arial, sans-serif' }}>
        {/* Desktop sidebar */}
        <div className="admin-desktop-sidebar" style={{ width: collapsed ? 60 : 220, background: '#111115', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, transition: 'width 0.2s', overflow: 'hidden', flexShrink: 0 }}>
          <SidebarContent />
        </div>

        {/* Mobile header */}
        <div className="admin-mobile-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 50, background: '#111115', borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 200, alignItems: 'center', padding: '0 16px', gap: 12 }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 13, fontWeight: 900, letterSpacing: 1 }}>
            <span style={{ color: '#e50914' }}>FILM ILEB</span><span style={{ color: '#fff' }}> ADMIN</span>
          </div>
          <Link href="/" style={{ marginLeft: 'auto', color: '#444', textDecoration: 'none', fontSize: 11, letterSpacing: 0.8, fontFamily: 'Arial, sans-serif' }}>← SITE</Link>
        </div>

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div className="admin-mobile-drawer">
            <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300 }} />
            <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, background: '#111115', borderRight: '1px solid rgba(255,255,255,0.08)', zIndex: 301, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main scrollable content */}
        <div className="admin-main-content" style={{ marginLeft: collapsed ? 60 : 220, flex: 1, minHeight: '100vh', overflowY: 'auto', transition: 'margin-left 0.2s' }}>
          {/* Mobile top spacer */}
          <div style={{ height: 0 }} className="admin-mobile-spacer" />
          <style>{`@media (max-width: 768px) { .admin-mobile-spacer { height: 50px !important; } }`}</style>
          {children}
        </div>
      </div>
    </>
  );
}
