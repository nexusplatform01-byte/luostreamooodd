import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ContentDoc, EpisodeDoc, addToHistory, getAllContent } from '../lib/db';
import { useApp } from '../context/AppContext';
import MuxPlayer from '@mux/mux-player-react';
import VideoCard from '../components/VideoCard';
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

export default function PlayPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, openVip } = useApp();
  const [content, setContent] = useState<ContentDoc | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeDoc[]>([]);
  const [activeEp, setActiveEp] = useState<EpisodeDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount] = useState(() => Math.floor(Math.random() * 20));
  const [saveCount] = useState(() => Math.floor(Math.random() * 10));
  const [tab, setTab] = useState<'episodes' | 'recommended' | 'synopsis' | 'comments'>('recommended');
  const [epSort, setEpSort] = useState<'asc' | 'desc'>('asc');
  const [recommended, setRecommended] = useState<FeedCard[]>([]);
  const [desktopTab, setDesktopTab] = useState<'video' | 'discuss'>('video');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'content', id));
        if (snap.exists()) {
          const c = { id: snap.id, ...snap.data() } as ContentDoc;
          setContent(c);
          updateDoc(doc(db, 'content', id), { views: increment(1) }).catch(() => {});
          addToHistory({ contentId: c.id!, title: c.title, thumbnail: c.thumbnail, watchedAt: Date.now() });
          if (c.type === 'series') {
            const epSnap = await getDocs(query(collection(db, 'episodes'), where('seriesId', '==', id), orderBy('episodeNumber', 'asc')));
            const eps = epSnap.docs.map(d => ({ id: d.id, ...d.data() } as EpisodeDoc));
            setEpisodes(eps);
            if (eps.length) setActiveEp(eps[0]);
            setTab('episodes');
          }
          // load recommended
          const all = await getAllContent().catch(() => [] as ContentDoc[]);
          const recs = all.filter(x => x.id !== id && (x.category === c.category || x.type === c.type)).slice(0, 12);
          setRecommended(recs.map(contentToCard));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const currentVideo = activeEp?.videoUrl || content?.videoUrl || '';
  const currentTitle = activeEp ? `EP ${activeEp.episodeNumber}: ${activeEp.title}` : content?.title || '';
  const isVipRequired = activeEp ? !activeEp.isFree : false;
  const canWatch = !isVipRequired || user?.isVip;

  const sortedEpisodes = epSort === 'asc' ? [...episodes] : [...episodes].reverse();

  const renderPlayer = () => {
    if (!currentVideo) {
      return (
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round"><path d="M5 3l14 9-14 9V3z"/></svg>
          <span style={{ color: '#333', fontSize: 11, letterSpacing: 1, fontFamily: 'Arial, sans-serif' }}>NO VIDEO SOURCE</span>
        </div>
      );
    }
    if (!canWatch) {
      return (
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden' }}>
          {content?.thumbnail && <img src={content.thumbnail} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} alt="" />}
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: 1, fontFamily: 'Arial, sans-serif', marginBottom: 6 }}>VIP CONTENT</div>
            <div style={{ color: '#888', fontSize: 11, letterSpacing: 0.8, fontFamily: 'Arial, sans-serif', marginBottom: 16 }}>SUBSCRIBE TO WATCH THIS EPISODE</div>
            <button onClick={openVip} style={{ background: 'linear-gradient(135deg,#f5a623,#e08a00)', border: 'none', borderRadius: 8, color: '#fff', padding: '10px 24px', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
              GET VIP
            </button>
          </div>
        </div>
      );
    }
    const isMuxId = currentVideo && !currentVideo.startsWith('http') && !currentVideo.startsWith('//');
    return (
      <MuxPlayer
        style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}
        {...(isMuxId ? { playbackId: currentVideo } : { src: currentVideo })}
        poster={content?.thumbnail || undefined}
        title={currentTitle}
        accentColor="#e50914"
        autoPlay={false}
        preload="metadata"
      />
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#444', fontFamily: 'Arial, sans-serif', fontSize: 12, letterSpacing: 1 }}>
        LOADING...
      </div>
    );
  }

  if (!content) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ fontSize: 48, color: '#222' }}>404</div>
        <div style={{ color: '#555', fontSize: 12, letterSpacing: 1 }}>CONTENT NOT FOUND</div>
        <Link href="/" style={{ color: '#e50914', fontSize: 11, letterSpacing: 1, textDecoration: 'none' }}>BACK TO HOME</Link>
      </div>
    );
  }

  const isSeries = content.type === 'series';

  /* ── MOBILE LAYOUT ── */
  const mobileLayout = (
    <div className="play-mobile-layout" style={{ background: '#0d0d0d', minHeight: '100vh', color: '#e0e0e0', fontFamily: 'Arial, sans-serif' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '7px 12px', fontSize: 11, color: '#555', display: 'flex', gap: 5, alignItems: 'center', borderBottom: '1px solid #1a1a1a' }}>
        <span onClick={() => navigate('/')} style={{ color: '#555', cursor: 'pointer' }}>HOME</span>
        <span>›</span>
        <span onClick={() => navigate(`/${content.category}`)} style={{ color: '#555', cursor: 'pointer', textTransform: 'uppercase' }}>{content.category}</span>
        <span>›</span>
        <span style={{ color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{content.title}</span>
      </div>

      {/* Video player — full width, black bg, portrait poster centered */}
      <div style={{ width: '100%', background: '#000', position: 'relative' }}>
        {renderPlayer()}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 10px 8px', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={() => setIsLiked(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: isLiked ? 'rgba(229,9,20,0.15)' : '#1a1a1a', border: `1px solid ${isLiked ? '#e50914' : '#2a2a2a'}`, borderRadius: 20, color: isLiked ? '#e50914' : '#aaa', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? '#e50914' : 'none'} stroke={isLiked ? '#e50914' : '#aaa'} strokeWidth="2" strokeLinecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          LIKE {likeCount + (isLiked ? 1 : 0)}
        </button>
        <button onClick={() => setIsSaved(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: isSaved ? 'rgba(229,9,20,0.15)' : '#1a1a1a', border: `1px solid ${isSaved ? '#e50914' : '#2a2a2a'}`, borderRadius: 20, color: isSaved ? '#e50914' : '#aaa', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? '#e50914' : 'none'} stroke={isSaved ? '#e50914' : '#aaa'} strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          SAVE {saveCount + (isSaved ? 1 : 0)}
        </button>
        <button onClick={() => navigator.share?.({ title: content.title, url: window.location.href }).catch(() => {})} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 20, color: '#aaa', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'Arial, sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          SHARE
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 20, color: '#aaa', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'Arial, sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          DOWNLOAD
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: 'linear-gradient(135deg,#6c63ff,#4a43cc)', border: 'none', borderRadius: 20, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          OPEN IN APP
        </button>
      </div>

      {/* Title and info */}
      <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ background: isSeries ? '#1a4a8a' : '#1a1a1a', color: isSeries ? '#4a9eff' : '#888', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, border: `1px solid ${isSeries ? '#4a9eff44' : '#2a2a2a'}`, letterSpacing: 0.5, flexShrink: 0 }}>
            {isSeries ? 'SERIES' : 'MOVIE'}
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: 0.3 }}>{content.title}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {content.rating && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ color: '#f5a623', fontSize: 13 }}>★</span>
              <span style={{ color: '#f5a623', fontSize: 12, fontWeight: 700 }}>{content.rating}</span>
            </span>
          )}
          {content.year && <span style={{ color: '#777', fontSize: 12 }}>| {content.year}</span>}
          {isSeries && content.totalEpisodes && <span style={{ color: '#777', fontSize: 12 }}>| {content.totalEpisodes} EPS</span>}
          {content.category && (
            <span style={{ background: 'rgba(229,9,20,0.12)', color: '#e50914', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(229,9,20,0.25)', textTransform: 'uppercase' }}>
              {content.category}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #1a1a1a', background: '#111' }}>
        {(isSeries ? ['episodes', 'recommended', 'synopsis', 'comments'] : ['recommended', 'synopsis', 'comments']).map(t => (
          <button key={t} onClick={() => setTab(t as any)}
            style={{ flex: 1, padding: '11px 4px', background: 'transparent', border: 'none', borderBottom: tab === t ? '2px solid #e50914' : '2px solid transparent', marginBottom: -2, color: tab === t ? '#fff' : '#666', fontSize: 11, fontWeight: tab === t ? 700 : 400, cursor: 'pointer', fontFamily: 'Arial, sans-serif', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {t === 'episodes' ? 'EPISODES' : t === 'recommended' ? 'RECOMMEND' : t === 'synopsis' ? 'SYNOPSIS' : 'COMMENTS'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '12px 10px 80px' }}>
        {tab === 'episodes' && isSeries && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#777', fontWeight: 700 }}>SORT</span>
              <button onClick={() => setEpSort('asc')} style={{ padding: '3px 10px', background: epSort === 'asc' ? '#e50914' : '#1a1a1a', border: `1px solid ${epSort === 'asc' ? '#e50914' : '#2a2a2a'}`, borderRadius: 3, color: epSort === 'asc' ? '#fff' : '#666', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>ASC</button>
              <button onClick={() => setEpSort('desc')} style={{ padding: '3px 10px', background: epSort === 'desc' ? '#e50914' : '#1a1a1a', border: `1px solid ${epSort === 'desc' ? '#e50914' : '#2a2a2a'}`, borderRadius: 3, color: epSort === 'desc' ? '#fff' : '#666', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>DESC</button>
            </div>
            {episodes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#444', fontSize: 12 }}>NO EPISODES YET</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {sortedEpisodes.map(ep => (
                  <button key={ep.id} onClick={() => setActiveEp(ep)}
                    style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, border: activeEp?.id === ep.id ? '1px solid #e50914' : '1px solid #2a2a2a', background: activeEp?.id === ep.id ? '#e50914' : '#1a1a1a', color: activeEp?.id === ep.id ? '#fff' : '#888', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif', position: 'relative' }}>
                    {ep.episodeNumber}
                    {!ep.isFree && <span style={{ fontSize: 7, color: activeEp?.id === ep.id ? '#fff' : '#f5a623', fontWeight: 700 }}>VIP</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'recommended' && (
          <div>
            {recommended.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#444', fontSize: 12 }}>NO RECOMMENDATIONS YET</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 8px' }}>
                {recommended.map(card => <VideoCard key={card.id} card={card} />)}
              </div>
            )}
          </div>
        )}

        {tab === 'synopsis' && (
          <div>
            <div style={{ fontSize: 13, color: '#999', lineHeight: 1.7 }}>{content.description || 'No synopsis available.'}</div>
            {content.tags && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
                {content.tags.split(',').map(t => (
                  <span key={t} style={{ background: '#1e1e1e', color: '#888', fontSize: 10, padding: '3px 9px', borderRadius: 4, border: '1px solid #2a2a2a' }}>{t.trim()}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'comments' && (
          <div>
            <div style={{ textAlign: 'center', padding: '20px 0 16px', color: '#555', fontSize: 12 }}>NO COMMENTS YET</div>
            <textarea placeholder="SHARE YOUR THOUGHTS..." style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: 12, color: '#ccc', fontSize: 12, resize: 'none', height: 80, fontFamily: 'Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            <button style={{ marginTop: 8, width: '100%', padding: '10px', background: '#e50914', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>POST COMMENT</button>
          </div>
        )}
      </div>
    </div>
  );

  /* ── DESKTOP LAYOUT ── */
  const desktopLayout = (
    <div className="play-desktop-layout" style={{ background: '#0d0d0d', minHeight: '100vh', color: '#e0e0e0', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ padding: '8px 24px', fontSize: 11, color: '#555', display: 'flex', gap: 6, alignItems: 'center' }}>
        <Link href="/"><span style={{ color: '#555', cursor: 'pointer' }}>HOME</span></Link>
        <span>›</span>
        <Link href={`/${content.category}`}><span style={{ color: '#555', cursor: 'pointer', textTransform: 'uppercase' }}>{content.category}</span></Link>
        <span>›</span>
        <span style={{ color: '#999' }}>{content.title}</span>
      </div>

      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ position: 'relative', background: '#000', width: '100%', maxHeight: 540, overflow: 'hidden' }}>
            {renderPlayer()}
            {canWatch && currentVideo && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '10px 14px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'none' }}>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>{content.title}</span>
                {content.badge && <span style={{ background: '#e50914', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 2 }}>{content.badge}</span>}
              </div>
            )}
          </div>

          {content.type === 'series' && episodes.length > 0 && (
            <div style={{ background: '#111', borderBottom: '1px solid #1e1e1e', padding: '10px 16px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
              <span style={{ fontSize: 12, color: '#666', flexShrink: 0, paddingTop: 4 }}>EPISODES:</span>
              {episodes.map(ep => (
                <button key={ep.id} onClick={() => setActiveEp(ep)}
                  style={{ minWidth: 36, height: 28, border: activeEp?.id === ep.id ? '1px solid #e50914' : '1px solid #2a2a2a', background: activeEp?.id === ep.id ? '#e50914' : '#181818', color: activeEp?.id === ep.id ? '#fff' : '#666', borderRadius: 3, fontSize: 11, cursor: 'pointer', fontFamily: 'Arial, sans-serif', flexShrink: 0 }}>
                  {ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}
                  {!ep.isFree && <span style={{ fontSize: 7, marginLeft: 2, color: '#f5a623' }}>V</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: 320, flexShrink: 0, background: '#0f0f0f', borderLeft: '1px solid #1a1a1a', minHeight: 400 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #1e1e1e' }}>
            {(['video', 'discuss'] as const).map(t => (
              <button key={t} onClick={() => setDesktopTab(t)} style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', borderBottom: desktopTab === t ? '2px solid #e50914' : '2px solid transparent', color: desktopTab === t ? '#fff' : '#666', fontSize: 12, fontWeight: desktopTab === t ? 700 : 400, cursor: 'pointer', fontFamily: 'Arial, sans-serif', letterSpacing: '0.05em' }}>
                {t === 'video' ? 'INFO' : 'DISCUSSION'}
              </button>
            ))}
          </div>

          {desktopTab === 'video' ? (
            <div style={{ overflowY: 'auto', maxHeight: 700, scrollbarWidth: 'thin', scrollbarColor: '#2a2a2a #111' }}>
              <div style={{ padding: '14px 14px 10px' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{content.title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                  {content.year && <span style={{ color: '#666', fontSize: 11 }}>{content.year}</span>}
                  {content.rating && <span style={{ color: '#f5a623', fontSize: 11, fontWeight: 700 }}>{content.rating}</span>}
                  {content.duration && <span style={{ color: '#555', fontSize: 10 }}>{content.duration}</span>}
                </div>
                {content.tags && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {content.tags.split(',').map(t => (
                      <span key={t} style={{ background: '#1e1e1e', color: '#888', fontSize: 10, padding: '2px 7px', borderRadius: 2, border: '1px solid #2a2a2a' }}>{t.trim()}</span>
                    ))}
                  </div>
                )}
                {content.description && <div style={{ fontSize: 11, color: '#777', lineHeight: 1.6, marginBottom: 12 }}>{content.description}</div>}
                <div style={{ display: 'flex', gap: 16, paddingBottom: 12, borderBottom: '1px solid #1e1e1e' }}>
                  <button onClick={() => setIsLiked(!isLiked)} style={{ background: 'transparent', border: 'none', color: isLiked ? '#e50914' : '#888', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? '#e50914' : 'none'} stroke={isLiked ? '#e50914' : '#888'} strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span style={{ fontSize: 9, color: isLiked ? '#e50914' : '#666' }}>LIKE</span>
                  </button>
                  <button onClick={() => navigator.share?.({ title: content.title, url: window.location.href }).catch(() => {})} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                    <span style={{ fontSize: 9, color: '#666' }}>SHARE</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 8 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>NO COMMENTS YET</div>
              </div>
              <textarea placeholder="SHARE YOUR THOUGHTS..." style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, padding: 10, color: '#ccc', fontSize: 12, resize: 'none', height: 80, fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', outline: 'none', boxSizing: 'border-box' }} />
              <button style={{ marginTop: 8, padding: '6px 20px', background: '#e50914', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontFamily: 'Arial, sans-serif', letterSpacing: '0.05em' }}>POST COMMENT</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileLayout}
      {desktopLayout}
    </>
  );
}
