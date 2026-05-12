import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ContentDoc } from '../lib/db';
import VideoCard from '../components/VideoCard';
import type { FeedCard } from '../data/content';

interface Props { categoryId?: string }

const BADGE_CLASSES: Record<string, string> = {
  'FREE NOW': 'tag_RED_2-nUp', 'EXCLUSIVE': 'tag_RED_2-nUp', 'PREMIERE': 'tag_BLUE_o8YDy',
  'VIP': 'tag_VIP_qFqRf', 'SVIP': 'tag_SVIP_COLORFUL_2rSkq', 'HOT CHART TOP': 'tag_RED_2-nUp',
  'NEW ARRIVAL': 'tag_BLUE_o8YDy', 'UPDATED NEW': 'tag_RED_2-nUp',
};

const CATEGORY_TITLES: Record<string, { title: string; subtitle: string; color: string; gradient: string }> = {
  drama:      { title: 'TV DRAMA',     subtitle: 'LATEST DRAMAS & SERIES',      color: '#e50914', gradient: 'linear-gradient(135deg,#1a0000,#2d0000)' },
  anime:      { title: 'ANIME',        subtitle: 'TRENDING ANIME SERIES',       color: '#6c63ff', gradient: 'linear-gradient(135deg,#0d0a1a,#15102d)' },
  movies:     { title: 'MOVIES',       subtitle: 'BLOCKBUSTER FILMS',           color: '#f5a623', gradient: 'linear-gradient(135deg,#1a1000,#2d1e00)' },
  variety:    { title: 'VARIETY',      subtitle: 'ENTERTAINMENT & SHOWS',       color: '#22c55e', gradient: 'linear-gradient(135deg,#001a0a,#002d14)' },
  short:      { title: 'SHORT DRAMA',  subtitle: 'BITE-SIZED ENTERTAINMENT',    color: '#e91e8c', gradient: 'linear-gradient(135deg,#1a0012,#2d001f)' },
  kids:       { title: 'KIDS',         subtitle: 'FAMILY-FRIENDLY CONTENT',     color: '#4a9eff', gradient: 'linear-gradient(135deg,#00101a,#001a2d)' },
  vip:        { title: 'VIP EXCLUSIVE',subtitle: 'PREMIUM MEMBERS ONLY',        color: '#f5a623', gradient: 'linear-gradient(135deg,#1a1000,#2d1e00)' },
  documentary:{ title: 'DOCUMENTARY',  subtitle: 'REAL STORIES, REAL IMPACT',   color: '#888',    gradient: 'linear-gradient(135deg,#111,#1a1a1a)' },
  sports:     { title: 'SPORTS',       subtitle: 'LIVE & RECORDED SPORTS',      color: '#22c55e', gradient: 'linear-gradient(135deg,#001a0a,#002d14)' },
  culture:    { title: 'CULTURE',      subtitle: 'ARTS & CULTURE WORLDWIDE',    color: '#a855f7', gradient: 'linear-gradient(135deg,#0e001a,#18002d)' },
  live:       { title: 'LIVE',         subtitle: 'LIVE STREAMING CHANNELS',     color: '#e50914', gradient: 'linear-gradient(135deg,#1a0000,#2d0000)' },
  games:      { title: 'GAMES',        subtitle: 'GAMING SHOWS & ESPORTS',      color: '#6c63ff', gradient: 'linear-gradient(135deg,#0d0a1a,#15102d)' },
  learning:   { title: 'LEARNING',     subtitle: 'EDUCATIONAL CONTENT',         color: '#4a9eff', gradient: 'linear-gradient(135deg,#00101a,#001a2d)' },
  knowledge:  { title: 'KNOWLEDGE',    subtitle: 'SCIENCE & TECHNOLOGY',        color: '#22c55e', gradient: 'linear-gradient(135deg,#001a0a,#002d14)' },
  'new-films':{ title: 'NEW FILMS',    subtitle: 'JUST RELEASED MOVIES',        color: '#f5a623', gradient: 'linear-gradient(135deg,#1a1000,#2d1e00)' },
  health:     { title: 'HEALTH',       subtitle: 'WELLNESS & LIFESTYLE',        color: '#22c55e', gradient: 'linear-gradient(135deg,#001a0a,#002d14)' },
  charity:    { title: 'CHARITY',      subtitle: 'GIVING BACK TO COMMUNITIES',  color: '#e91e8c', gradient: 'linear-gradient(135deg,#1a0012,#2d001f)' },
  accessible: { title: 'ACCESSIBLE',   subtitle: 'CONTENT FOR EVERYONE',        color: '#4a9eff', gradient: 'linear-gradient(135deg,#00101a,#001a2d)' },
};

function contentToCard(c: ContentDoc): FeedCard {
  const badge = c.badge || '';
  return {
    id: c.id!,
    image: c.thumbnail || 'https://via.placeholder.com/300x450/1a1a1a/333?text=NO+IMAGE',
    badgeClass: BADGE_CLASSES[badge] || 'tag_RED_2-nUp',
    badgeText: badge || undefined,
    episodeText: c.type === 'series'
      ? `${c.category?.toUpperCase()} · EPS ${c.totalEpisodes || '?'}`
      : c.type === 'live'
      ? `LIVE · ${c.language || 'STREAMING'}`
      : `FILM · ${c.duration || c.year || ''}`,
    title: c.title,
    subtitle: c.description ? c.description.slice(0, 50) : '',
    playId: c.id,
  };
}

export default function CategoryPage({ categoryId }: Props) {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'HOT'|'NEWEST'|'RATING'>('HOT');
  const [rawItems, setRawItems] = useState<ContentDoc[]>([]);

  const catId = categoryId || 'drama';
  const meta = CATEGORY_TITLES[catId] || { title: catId.toUpperCase(), subtitle: 'BROWSE CONTENT', color: '#e50914', gradient: 'linear-gradient(135deg,#1a0000,#2d0000)' };

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        let q;
        if (catId === 'live') {
          q = query(collection(db, 'content'), where('type', '==', 'live'));
        } else if (catId === 'vip') {
          q = query(collection(db, 'content'), where('badge', 'in', ['VIP','SVIP']));
        } else if (catId === 'new-films' || catId === 'movies') {
          q = query(collection(db, 'content'), where('type', '==', 'movie'));
        } else {
          q = query(collection(db, 'content'), where('category', '==', catId));
        }
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentDoc));
        data.sort((a, b) => ((b.createdAt as any)?.seconds || 0) - ((a.createdAt as any)?.seconds || 0));
        setRawItems(data);
        setCards(data.map(contentToCard));
      } catch (e) {
        console.error(e);
        setCards([]);
      } finally { setLoading(false); }
    };
    load();
  }, [catId]);

  useEffect(() => {
    if (!rawItems.length) return;
    let sorted = [...rawItems];
    if (sortBy === 'HOT') sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (sortBy === 'NEWEST') sorted.sort((a, b) => ((b.createdAt as any)?.seconds || 0) - ((a.createdAt as any)?.seconds || 0));
    else if (sortBy === 'RATING') sorted.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
    setCards(sorted.map(contentToCard));
  }, [sortBy, rawItems]);

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', color: '#e0e0e0', fontFamily: 'Arial, sans-serif' }}>
      {/* Banner */}
      <div style={{ background: meta.gradient, borderBottom: `2px solid ${meta.color}22`, padding: '20px 24px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, background: `radial-gradient(circle, ${meta.color}33, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 4 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '0.05em', margin: 0, fontFamily: '"Arial Black", Arial, sans-serif', textShadow: `0 0 30px ${meta.color}88` }}>{meta.title}</h1>
            <span style={{ fontSize: 12, color: '#888', paddingBottom: 4, letterSpacing: '0.04em' }}>{meta.subtitle}</span>
          </div>
          <div style={{ width: 48, height: 3, background: meta.color, borderRadius: 2, marginBottom: 16 }} />
        </div>
      </div>

      {/* Sort bar */}
      <div style={{ padding: '10px 24px', background: '#0f0f0f', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 11, color: '#555' }}>SORT BY:</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['HOT','NEWEST','RATING'] as const).map(opt => (
            <button key={opt} onClick={() => setSortBy(opt)} style={{ padding: '4px 10px', background: sortBy === opt ? meta.color : '#1a1a1a', border: `1px solid ${sortBy === opt ? meta.color : '#2a2a2a'}`, color: sortBy === opt ? '#fff' : '#666', borderRadius: 3, fontSize: 10, cursor: 'pointer', fontFamily: 'Arial, sans-serif', letterSpacing: '0.04em' }}>
              {opt}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: '#444', marginLeft: 'auto' }}>{cards.length} TITLES</span>
      </div>

      {/* Cards */}
      <div className="category-cards-wrap" style={{ padding: '16px 24px 32px' }}>
        {loading ? (
          <div className="mobile-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px 10px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ background: '#1a1a1a', borderRadius: 6, paddingBottom: '145%', position: 'relative', opacity: 0.4 }} />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 16 }}><path d="M2 8h20M2 16h20M8 2v4M16 2v4M8 18v4M16 18v4M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/></svg>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#444', marginBottom: 8, letterSpacing: '0.05em' }}>{meta.title}</div>
            <div style={{ fontSize: 12, color: '#333' }}>NO CONTENT ADDED YET — USE THE ADMIN PANEL TO ADD CONTENT</div>
            <div style={{ width: 40, height: 2, background: meta.color, borderRadius: 2, margin: '16px auto 0', opacity: 0.5 }} />
          </div>
        ) : (
          <div className="mobile-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px 10px' }}>
            {cards.map(card => <VideoCard key={card.id} card={card} />)}
          </div>
        )}
      </div>
    </div>
  );
}
