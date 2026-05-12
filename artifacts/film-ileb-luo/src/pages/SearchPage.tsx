import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { getAllContent, ContentDoc } from '../lib/db';
import VideoCard from '../components/VideoCard';
import type { FeedCard } from '../data/content';

const BADGE_CLASSES: Record<string, string> = {
  'FREE NOW': 'tag_RED_2-nUp', 'EXCLUSIVE': 'tag_RED_2-nUp', 'PREMIERE': 'tag_BLUE_o8YDy',
  'VIP': 'tag_YELLOW_3uzKD', 'SVIP': 'tag_SVIP_COLORFUL_2rSkq',
  'NEW ARRIVAL': 'tag_BLUE_o8YDy', 'UPDATED NEW': 'tag_RED_2-nUp',
};

const FILTER_TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'movie', label: 'MOVIES' },
  { id: 'series', label: 'SERIES' },
  { id: 'drama', label: 'DRAMA' },
  { id: 'anime', label: 'ANIME' },
  { id: 'variety', label: 'VARIETY' },
  { id: 'live', label: 'LIVE' },
];

const HISTORY_KEY = 'film_ileb_luo_search_history';

function getSearchHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveSearchHistory(q: string) {
  try {
    const h = getSearchHistory().filter(x => x !== q);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([q, ...h].slice(0, 10)));
  } catch {}
}
function clearSearchHistory() {
  try { localStorage.removeItem(HISTORY_KEY); } catch {}
}

function contentToCard(c: ContentDoc): FeedCard {
  const badge = c.badge || '';
  return {
    id: c.id!,
    image: c.thumbnail || '',
    badgeClass: BADGE_CLASSES[badge] || '',
    badgeText: badge || undefined,
    episodeText: c.type === 'series'
      ? `${c.category?.toUpperCase()} · ${c.totalEpisodes ? c.totalEpisodes + ' EPS' : 'SERIES'}`
      : c.type === 'live' ? `LIVE · ${c.language || 'STREAMING'}`
      : `${c.category?.toUpperCase() || 'FILM'}`,
    title: c.title,
    subtitle: c.description ? c.description.slice(0, 60) : '',
    playId: c.id,
  };
}

export default function SearchPage() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [allContent, setAllContent] = useState<ContentDoc[]>([]);
  const [results, setResults] = useState<FeedCard[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(getSearchHistory());
    setLoading(true);
    getAllContent().then(d => { setAllContent(d); setLoading(false); }).catch(() => setLoading(false));
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); return; }
    let filtered = allContent.filter(c => {
      const matchesQuery =
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q);
      const matchesFilter = filter === 'all' ? true
        : filter === 'movie' ? c.type === 'movie'
        : filter === 'series' ? c.type === 'series'
        : c.category?.toLowerCase() === filter || c.type === filter;
      return matchesQuery && matchesFilter;
    });
    setResults(filtered.map(contentToCard));
  }, [query, filter, allContent]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) saveSearchHistory(query.trim());
  };

  const handleHistoryClick = (h: string) => {
    setQuery(h);
    inputRef.current?.focus();
  };

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Search header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#111', borderBottom: '1px solid #1e1e1e', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px 2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 20, height: 34, padding: '0 12px', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="SEARCH MOVIES, DRAMAS, ANIME..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e0e0e0', fontSize: 12, fontFamily: 'Arial, sans-serif', letterSpacing: 0.3 }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </form>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', overflowX: 'auto', scrollbarWidth: 'none', background: '#0f0f0f', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
        {FILTER_TABS.map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)}
            style={{ flexShrink: 0, padding: '4px 12px', background: filter === tab.id ? '#e50914' : '#1a1a1a', border: `1px solid ${filter === tab.id ? '#e50914' : '#2a2a2a'}`, borderRadius: 14, color: filter === tab.id ? '#fff' : '#666', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif', letterSpacing: 0.5 }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px 80px' }}>
        {/* No query — show history and hot categories */}
        {!query.trim() && (
          <div>
            {history.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1 }}>RECENT SEARCHES</span>
                  <button onClick={() => { clearSearchHistory(); setHistory([]); }} style={{ background: 'none', border: 'none', color: '#444', fontSize: 10, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>CLEAR</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {history.map(h => (
                    <button key={h} onClick={() => handleHistoryClick(h)}
                      style={{ padding: '5px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, color: '#888', fontSize: 11, cursor: 'pointer', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hot categories */}
            <div>
              <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>BROWSE CATEGORIES</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: 'DRAMA', path: '/drama', color: '#e50914', bg: '#1a0000' },
                  { label: 'ANIME', path: '/anime', color: '#6c63ff', bg: '#0d0a1a' },
                  { label: 'MOVIES', path: '/movies', color: '#f5a623', bg: '#1a1000' },
                  { label: 'VARIETY', path: '/variety', color: '#22c55e', bg: '#001a0a' },
                  { label: 'KIDS', path: '/kids', color: '#4a9eff', bg: '#00101a' },
                  { label: 'LIVE', path: '/live', color: '#e50914', bg: '#1a0000' },
                  { label: 'SPORTS', path: '/sports', color: '#22c55e', bg: '#001a0a' },
                  { label: 'DOCS', path: '/documentary', color: '#888', bg: '#111' },
                  { label: 'SHORT', path: '/short', color: '#e91e8c', bg: '#1a0012' },
                ].map(cat => (
                  <button key={cat.path} onClick={() => navigate(cat.path)}
                    style={{ padding: '14px 8px', background: cat.bg, border: `1px solid ${cat.color}30`, borderRadius: 8, color: cat.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif', letterSpacing: 0.8, textAlign: 'center' }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* All content on empty query */}
            {allContent.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>ALL CONTENT</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 6px' }}>
                  {allContent.slice(0, 18).map(c => <VideoCard key={c.id} card={contentToCard(c)} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {query.trim() && (
          <div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 10, letterSpacing: 0.5 }}>
              {results.length} RESULTS FOR "<span style={{ color: '#fff' }}>{query.trim().toUpperCase()}</span>"
            </div>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#444' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 12 }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <div style={{ fontSize: 13, color: '#444', marginBottom: 6 }}>NO RESULTS FOUND</div>
                <div style={{ fontSize: 10, color: '#333' }}>TRY A DIFFERENT KEYWORD OR CATEGORY</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 6px' }}>
                {results.map(card => <VideoCard key={card.id} card={card} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
