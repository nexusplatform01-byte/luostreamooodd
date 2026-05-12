import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useApp, ADMIN_EMAILS } from '../context/AppContext';

const NAV_ITEMS = [
  {
    id: 'home', label: 'HOME', path: '/',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#e50914' : 'none'} stroke={active ? '#e50914' : '#888'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'movies', label: 'MOVIES', path: '/movies',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e50914' : '#888'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
        <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/>
        <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
        <line x1="17" y1="7" x2="22" y2="7"/>
      </svg>
    ),
  },
  {
    id: 'drama', label: 'DRAMA', path: '/drama',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e50914' : '#888'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    id: 'vip', label: 'VIP', path: '/vip',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f5a623' : '#888'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    id: 'more', label: 'MORE', path: null,
    icon: (_active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    ),
  },
];

const MORE_ITEMS = [
  { label: 'ANIME', path: '/anime' },
  { label: 'VARIETY', path: '/variety' },
  { label: 'SHORT DRAMA', path: '/short' },
  { label: 'KIDS', path: '/kids' },
  { label: 'DOCUMENTARY', path: '/documentary' },
  { label: 'SPORTS', path: '/sports' },
  { label: 'CULTURE', path: '/culture' },
  { label: 'LIVE', path: '/live' },
  { label: 'LEARNING', path: '/learning' },
  { label: 'HEALTH', path: '/health' },
];

export default function MobileBottomNav() {
  const [location, navigate] = useLocation();
  const { openVip, openLogin, isLoggedIn, user } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;

  return (
    <>
      {moreOpen && (
        <>
          <div onClick={() => setMoreOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1098, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{ position: 'fixed', bottom: 64, left: 0, right: 0, zIndex: 1099, background: '#16161a', borderTop: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px 20px 0 0', padding: '20px 16px 16px' }}>
            <div style={{ width: 40, height: 4, background: '#333', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ color: '#555', fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 14, fontFamily: 'Arial, sans-serif' }}>ALL CATEGORIES</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {MORE_ITEMS.map(item => (
                <button key={item.path} onClick={() => { navigate(item.path); setMoreOpen(false); }}
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#ccc', padding: '12px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, cursor: 'pointer', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
                  {item.label}
                </button>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => { openVip(); setMoreOpen(false); }}
                style={{ flex: 1, background: 'linear-gradient(135deg,#c8820a,#f5c840)', border: 'none', borderRadius: 10, color: '#3d1f00', padding: '12px', fontSize: 11, fontWeight: 900, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                ★ RENEW VIP
              </button>
              {!isLoggedIn && (
                <button onClick={() => { openLogin('login'); setMoreOpen(false); }}
                  style={{ flex: 1, background: '#e50914', border: 'none', borderRadius: 10, color: '#fff', padding: '12px', fontSize: 11, fontWeight: 900, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                  LOG IN
                </button>
              )}
              {isAdmin && (
                <button onClick={() => { navigate('/admin'); setMoreOpen(false); }}
                  style={{ width: '100%', background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.35)', borderRadius: 10, color: '#e50914', padding: '12px', fontSize: 11, fontWeight: 900, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e50914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  ADMIN PANEL
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map(item => {
          if (item.id === 'more') {
            return (
              <button key="more" className="mobile-nav-item" onClick={() => setMoreOpen(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1 }}>
                <div className="mobile-nav-icon">{item.icon(false)}</div>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            );
          }
          const isActive = item.path === '/' ? location === '/' : location.startsWith(item.path!);
          return (
            <Link key={item.id} href={item.path!} className="mobile-nav-item" style={{ flex: 1 }}>
              <div className="mobile-nav-icon" style={{ position: 'relative' }}>
                {isActive && (
                  <div style={{ position: 'absolute', inset: -6, background: 'rgba(229,9,20,0.12)', borderRadius: '50%' }} />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>{item.icon(isActive)}</div>
              </div>
              <span className="mobile-nav-label" style={{ color: isActive ? '#e50914' : '#888' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
