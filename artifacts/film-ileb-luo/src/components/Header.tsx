import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLocation } from 'wouter';
import { getAllContent, ContentDoc, getHistory, WatchHistoryDoc } from '../lib/db';

const CATEGORY_LINKS = [
  { label: 'DRAMA', path: '/drama' },
  { label: 'ANIME', path: '/anime' },
  { label: 'MOVIES', path: '/movies' },
  { label: 'VARIETY', path: '/variety' },
  { label: 'SHORT DRAMA', path: '/short' },
  { label: 'KIDS', path: '/kids' },
  { label: 'DOCUMENTARY', path: '/documentary' },
  { label: 'SPORTS', path: '/sports' },
  { label: 'CULTURE', path: '/culture' },
  { label: 'LIVE', path: '/live' },
];

export default function Header() {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<ContentDoc[]>([]);
  const [allContent, setAllContent] = useState<ContentDoc[]>([]);
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [appOpen, setAppOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<WatchHistoryDoc[]>([]);
  const { user, isLoggedIn, openLogin, openVip, logout } = useApp();
  const [, navigate] = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getAllContent().then(setAllContent).catch(() => {});
  }, []);

  useEffect(() => {
    if (!searchValue.trim()) { setSearchResults([]); setShowSearchDrop(false); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const q = searchValue.trim().toLowerCase();
      const results = allContent.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      ).slice(0, 8);
      setSearchResults(results);
      setShowSearchDrop(true);
    }, 200);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchValue, allContent]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openHistory = () => {
    setHistoryItems(getHistory());
    setHistoryOpen(true);
  };

  const closeAll = () => {
    setFilterOpen(false);
    setHistoryOpen(false);
    setAppOpen(false);
    setUserMenuOpen(false);
  };

  const navigateTo = (path: string) => {
    closeAll();
    navigate(path);
  };

  return (
    <>
      <div className="topheader_top_header_box">
        <div className="topheader_left_box">
          {/* Site name — mobile only */}
          <div className="mobile-site-name" style={{ display: 'none', alignItems: 'center', paddingLeft: 4 }}>
            <span style={{ fontFamily: '"Arial Black", Arial, sans-serif', fontSize: 15, fontWeight: 900, letterSpacing: 0.5 }}>
              <span style={{ color: '#e50914' }}>FILM</span>
              <span style={{ color: '#fff' }}> ILEB LUO</span>
            </span>
          </div>
        </div>
        <div className="topheader_right_box">

          {/* Search */}
          <div ref={searchRef} className="search_search_box" style={{ position: 'relative' }}>
            {/* Mobile: tap to go to /search page */}
            <div className="mobile-search-tap" style={{ display: 'none' }} onClick={() => navigate('/search')}>
              <div className="search_search_box_wrap" style={{ cursor: 'pointer' }}>
                <div className="search_search_input_box">
                  <svg className="search_search_icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <span style={{ fontSize: 11, color: '#555', fontFamily: 'Arial, sans-serif', letterSpacing: 0.3 }}>SEARCH...</span>
                </div>
              </div>
            </div>
            {/* Desktop: inline search with dropdown */}
            <div className="desktop-search-box">
              <div className="search_search_box_wrap">
                <div className="search_search_input_box">
                  <svg className="search_search_icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <div className="search_search_input_content">
                    <input
                      className="search_search_input"
                      type="text"
                      placeholder="SEARCH FILM ILEB LUO"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => { if (searchResults.length > 0) setShowSearchDrop(true); }}
                      style={{ fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {showSearchDrop && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, zIndex: 9999, marginTop: 4, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.8)', minWidth: 300 }}>
                {searchResults.length === 0 ? (
                  <div style={{ padding: '14px 16px', color: '#444', fontSize: 11, letterSpacing: 0.8, fontFamily: 'Arial, sans-serif' }}>NO RESULTS FOUND</div>
                ) : (
                  searchResults.map(item => (
                    <div key={item.id} onClick={() => { navigate(`/play/${item.id}`); setShowSearchDrop(false); setSearchValue(''); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {item.thumbnail ? (
                        <img src={item.thumbnail} style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} alt="" />
                      ) : (
                        <div style={{ width: 40, height: 56, background: '#222', borderRadius: 4, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, fontFamily: 'Arial, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                        <div style={{ color: '#555', fontSize: 10, marginTop: 2, fontFamily: 'Arial, sans-serif' }}>{item.category?.toUpperCase()} · {item.year || item.type?.toUpperCase()}</div>
                        {item.badge && <span style={{ background: '#e5091420', color: '#e50914', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '1px 6px', borderRadius: 3 }}>{item.badge}</span>}
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* VIP Button */}
          <div className="crmvip_vip_wrap" onClick={openVip} style={{ cursor: 'pointer' }}>
            <a className="youku_vip_pay_btn" href="#" onClick={e => e.preventDefault()}>
              <img
                className="crmvip_vip_icon"
                src="https://gw.alicdn.com/imgextra/i2/O1CN01G2pBlc1jH83k0Uw4y_!!6000000004522-2-tps-72-72.png"
                alt="VIP"
              />
              <div className="crmvip_vip_pop_content" style={{ fontFamily: 'Arial, sans-serif' }}>
                {user?.isVip ? 'VIP ACTIVE' : 'RENEW VIP'}
              </div>
            </a>
          </div>

          {/* Filter */}
          <div className="filter_filter_box" onClick={() => { closeAll(); setFilterOpen(v => !v); }} style={{ cursor: 'pointer', position: 'relative' }}>
            <img
              className="filter_filter_img"
              src="https://img.alicdn.com/imgextra/i3/O1CN01E71iNM29PXJkAdEx1_!!6000000008060-2-tps-48-48.png"
              alt=""
            />
            <div className="filter_text" style={{ fontFamily: 'Arial, sans-serif' }}>FILTER</div>
          </div>

          {/* History */}
          <div className="historyrecord_record_box" onClick={() => { closeAll(); openHistory(); }} style={{ cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <div className="historyrecord_text" style={{ fontFamily: 'Arial, sans-serif' }}>HISTORY</div>
          </div>

          {/* Client / App */}
          <div className="useiku_iku_box" onClick={() => { closeAll(); setAppOpen(v => !v); }} style={{ cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <div className="useiku_text" style={{ fontFamily: 'Arial, sans-serif' }}>APP</div>
          </div>

          {/* User */}
          <div className="crmusercenter_user_center_box" style={{ position: 'relative' }}>
            {isLoggedIn ? (
              <>
                <div
                  className="crmusercenter_avatar"
                  onClick={() => { closeAll(); setUserMenuOpen(!userMenuOpen); }}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#e50914,#6a0008)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, marginLeft: 6, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0] || 'USER'}
                  </span>
                </div>

                {userMenuOpen && (
                  <>
                    <div onClick={() => setUserMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 0', minWidth: 180, zIndex: 999, boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
                      <div style={{ padding: '10px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{user?.name}</div>
                        <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>{user?.email}</div>
                        {user?.isVip && <div style={{ color: '#f5a623', fontSize: 9, marginTop: 4, letterSpacing: 1 }}>👑 VIP MEMBER</div>}
                      </div>
                      {[
                        { label: 'MY PROFILE', action: () => {} },
                        { label: 'WATCH HISTORY', action: () => { setUserMenuOpen(false); openHistory(); } },
                        { label: 'MY WATCHLIST', action: () => {} },
                        ...(user?.isAdmin ? [{ label: 'ADMIN PANEL', action: () => { setUserMenuOpen(false); navigate('/admin'); } }] : []),
                      ].map(({ label, action }) => (
                        <div key={label} onClick={() => { action(); setUserMenuOpen(false); }} style={{ padding: '10px 16px', color: '#888', fontSize: 11, letterSpacing: 0.8, cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#888'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                          {label}
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4 }}>
                        <div onClick={() => { logout(); setUserMenuOpen(false); }} style={{ padding: '10px 16px', color: '#e50914', fontSize: 11, letterSpacing: 0.8, cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(229,9,20,0.05)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          LOG OUT
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div
                className="crmusercenter_avatar"
                onClick={() => openLogin('login')}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src="https://img.alicdn.com/imgextra/i4/O1CN01sm6Pik1QpxWLtcGPd_!!6000000002026-2-tps-180-180.png"
                  alt=""
                />
                <span style={{ fontFamily: 'Arial, sans-serif' }}>LOG IN</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <>
          <div onClick={() => setFilterOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000 }} />
          <div style={{ position: 'fixed', top: 48, right: 120, zIndex: 1001, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '20px 24px', minWidth: 260, boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 16, fontFamily: 'Arial, sans-serif' }}>FILTER BY GENRE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {CATEGORY_LINKS.map(cat => (
                <button key={cat.path} onClick={() => { navigateTo(cat.path); setFilterOpen(false); }}
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#888', padding: '8px 12px', fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e5091418'; (e.currentTarget as HTMLElement).style.color = '#e50914'; (e.currentTarget as HTMLElement).style.borderColor = '#e5091440'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#111'; (e.currentTarget as HTMLElement).style.color = '#888'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* History Panel */}
      {historyOpen && (
        <>
          <div onClick={() => setHistoryOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 340, zIndex: 1001, background: '#16161a', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', boxShadow: '-24px 0 60px rgba(0,0,0,0.6)' }}>
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: 1, fontFamily: 'Arial, sans-serif' }}>WATCH HISTORY</div>
                <div style={{ color: '#444', fontSize: 10, marginTop: 2, letterSpacing: 0.8, fontFamily: 'Arial, sans-serif' }}>{historyItems.length} RECENTLY WATCHED</div>
              </div>
              <button onClick={() => setHistoryOpen(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
              {historyItems.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#333', fontFamily: 'Arial, sans-serif' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 12 }}>
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div style={{ fontSize: 12, letterSpacing: 0.8 }}>NO WATCH HISTORY YET</div>
                  <div style={{ fontSize: 10, marginTop: 6, color: '#2a2a2a' }}>VIDEOS YOU WATCH WILL APPEAR HERE</div>
                </div>
              ) : (
                historyItems.map(item => (
                  <div key={item.contentId} onClick={() => { navigate(`/play/${item.contentId}`); setHistoryOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    {item.thumbnail ? (
                      <img src={item.thumbnail} style={{ width: 52, height: 74, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} alt="" />
                    ) : (
                      <div style={{ width: 52, height: 74, background: '#222', borderRadius: 6, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, fontFamily: 'Arial, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                      <div style={{ color: '#444', fontSize: 10, marginTop: 4, fontFamily: 'Arial, sans-serif' }}>
                        {new Date(item.watchedAt).toLocaleDateString('en-UG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* App Modal */}
      {appOpen && (
        <>
          <div onClick={() => setAppOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000 }} />
          <div style={{ position: 'fixed', top: 48, right: 60, zIndex: 1001, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '28px 28px 24px', width: 280, boxShadow: '0 16px 60px rgba(0,0,0,0.8)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#e50914,#6a0008)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 900, letterSpacing: 1, fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: 6 }}>FILM ILEB LUO</div>
            <div style={{ color: '#555', fontSize: 10, letterSpacing: 1, fontFamily: 'Arial, sans-serif', marginBottom: 20 }}>GET THE APP FOR THE BEST EXPERIENCE</div>

            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
              <svg width="80" height="80" viewBox="0 0 80 80" style={{ opacity: 0.4 }}>
                <rect width="80" height="80" rx="4" fill="#222"/>
                <rect x="8" y="8" width="24" height="24" rx="2" fill="#e50914"/>
                <rect x="14" y="14" width="12" height="12" rx="1" fill="#111"/>
                <rect x="48" y="8" width="24" height="24" rx="2" fill="#e50914"/>
                <rect x="54" y="14" width="12" height="12" rx="1" fill="#111"/>
                <rect x="8" y="48" width="24" height="24" rx="2" fill="#e50914"/>
                <rect x="14" y="54" width="12" height="12" rx="1" fill="#111"/>
                <rect x="48" y="48" width="8" height="8" rx="1" fill="#e50914"/>
                <rect x="64" y="48" width="8" height="8" rx="1" fill="#e50914"/>
                <rect x="48" y="64" width="8" height="8" rx="1" fill="#e50914"/>
                <rect x="64" y="64" width="8" height="8" rx="1" fill="#e50914"/>
              </svg>
              <div style={{ color: '#333', fontSize: 9, letterSpacing: 1, fontFamily: 'Arial, sans-serif', marginTop: 10 }}>SCAN QR CODE TO DOWNLOAD</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="#" onClick={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', textDecoration: 'none', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: 'Arial, sans-serif', transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12l3 3 5-6"/></svg>
                ANDROID APP
              </a>
              <a href="#" onClick={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', textDecoration: 'none', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: 'Arial, sans-serif', transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                IOS APP
              </a>
            </div>

            <button onClick={() => setAppOpen(false)} style={{ marginTop: 16, background: 'none', border: 'none', color: '#333', fontSize: 10, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>CLOSE</button>
          </div>
        </>
      )}
    </>
  );
}
