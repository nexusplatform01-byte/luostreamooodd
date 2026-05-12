import { useEffect, useState } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import VideoRow from '../components/VideoRow';
import { getAllContent, ContentDoc } from '../lib/db';
import type { FeedCard } from '../data/content';

const BADGE_CLASSES: Record<string, string> = {
  'FREE NOW': 'tag_RED_2-nUp', 'EXCLUSIVE': 'tag_RED_2-nUp', 'PREMIERE': 'tag_BLUE_o8YDy',
  'VIP': 'tag_YELLOW_3uzKD', 'SVIP': 'tag_SVIP_COLORFUL_2rSkq', 'HOT CHART TOP': 'tag_RED_2-nUp',
  'NEW ARRIVAL': 'tag_BLUE_o8YDy', 'UPDATED NEW': 'tag_RED_2-nUp',
};

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
    subtitle: c.description ? c.description.slice(0, 60) : c.category?.toUpperCase() || '',
    playId: c.id,
  };
}

const HOME_SECTIONS: { key: string; label: string; keyword?: string }[] = [
  { key: 'keep-watching', label: 'KEEP WATCHING', keyword: '4K ULTRA HD ZONE' },
  { key: 'trending', label: 'TRENDING NOW' },
  { key: 'new-arrivals', label: 'NEW ARRIVALS' },
  { key: 'top-drama', label: 'TOP DRAMAS' },
  { key: 'top-anime', label: 'TOP ANIME' },
  { key: 'top-movies', label: 'TOP MOVIES' },
  { key: 'vip-picks', label: 'VIP PICKS' },
  { key: 'featured', label: 'FEATURED' },
];

export default function Home() {
  const [allContent, setAllContent] = useState<ContentDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllContent().then(data => {
      setAllContent(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sectionRows: { label: string; cards: FeedCard[]; keyword?: string }[] = [];

  if (!loading && allContent.length > 0) {
    HOME_SECTIONS.forEach(sec => {
      const items = allContent.filter(c => c.homeSection === sec.key);
      if (items.length > 0) {
        sectionRows.push({ label: sec.label, cards: items.map(contentToCard), keyword: sec.keyword });
      }
    });

    if (sectionRows.length === 0) {
      const sorted = [...allContent].sort((a, b) => (b.views || 0) - (a.views || 0));
      const newest = [...allContent].sort((a, b) =>
        ((b.createdAt as any)?.seconds || 0) - ((a.createdAt as any)?.seconds || 0)
      );
      const movies = allContent.filter(c => c.type === 'movie');
      const series = allContent.filter(c => c.type === 'series');

      if (sorted.length > 0) sectionRows.push({ label: 'TRENDING NOW', cards: sorted.slice(0, 16).map(contentToCard) });
      if (newest.length > 0) sectionRows.push({ label: 'NEW ARRIVALS', cards: newest.slice(0, 16).map(contentToCard) });
      if (movies.length > 0) sectionRows.push({ label: 'MOVIES', cards: movies.slice(0, 16).map(contentToCard) });
      if (series.length > 0) sectionRows.push({ label: 'TV SERIES', cards: series.slice(0, 16).map(contentToCard) });
    }
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <HeroCarousel />

      {loading ? (
        <div style={{ padding: '40px 24px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ width: 148, background: '#16161a', borderRadius: 8, paddingBottom: '145%', position: 'relative', flex: '0 0 148px', opacity: 0.5 }} />
          ))}
        </div>
      ) : sectionRows.length > 0 ? (
        sectionRows.map(row => (
          <VideoRow key={row.label} title={row.label} cards={row.cards} keyword={row.keyword} />
        ))
      ) : (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: '#444', fontFamily: 'Arial, sans-serif' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 16 }}>
            <path d="M2 8h20M2 16h20M8 2v4M16 2v4M8 18v4M16 18v4M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
          </svg>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>NO CONTENT YET</div>
          <div style={{ fontSize: 11, letterSpacing: 0.8 }}>ADD MOVIES AND SERIES FROM THE ADMIN PANEL TO DISPLAY THEM HERE</div>
        </div>
      )}

      <div style={{ marginTop: 24, padding: '16px 16px 0', borderTop: '1px solid #1a1a1a', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          {['ABOUT US', 'HELP CENTER', 'TERMS OF SERVICE', 'PRIVACY POLICY', 'COPYRIGHT', 'FEEDBACK'].map((link) => (
            <a key={link} href="#" style={{ fontSize: 11, color: '#444', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#888'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#444'; }}>
              {link}
            </a>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#333', fontFamily: 'Arial, sans-serif' }}>
          © 2025 FILM ILEB LUO — ALL RIGHTS RESERVED
        </div>
      </div>
    </div>
  );
}
