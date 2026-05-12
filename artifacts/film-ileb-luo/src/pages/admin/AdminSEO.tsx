import { useState, useEffect } from 'react';
import { getSeoSettings, saveSeoSettings, SeoDoc } from '../../lib/db';
import { SEOIcon, CheckIcon, RefreshIcon } from '../../components/Icons';

export default function AdminSEO() {
  const [seo, setSeo] = useState<SeoDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [score, setScore] = useState(0);
  const [tab, setTab] = useState<'meta'|'social'|'analytics'|'sitemap'>('meta');

  useEffect(() => { getSeoSettings().then(s => { setSeo(s); calcScore(s); }); }, []);

  const calcScore = (s: SeoDoc) => {
    let sc = 0;
    if (s.title) sc += 15; if (s.description) sc += 15; if (s.keywords) sc += 10;
    if (s.ogTitle) sc += 10; if (s.ogDescription) sc += 10; if (s.ogImage) sc += 10;
    if (s.canonical) sc += 10; if (s.gaId) sc += 10; if (s.twitterCard) sc += 10;
    setScore(sc);
  };

  const set = (k: keyof SeoDoc, v: string) => setSeo(s => { if (!s) return s; const n = { ...s, [k]: v }; calcScore(n); return n; });

  const save = async () => {
    if (!seo) return;
    setSaving(true);
    try {
      await saveSeoSettings(seo);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  if (!seo) return <div style={{ padding: 40, color: '#444', fontFamily: 'Arial, sans-serif', fontSize: 12, letterSpacing: 1 }}>LOADING SEO SETTINGS...</div>;

  const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f5a623' : '#e50914';

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>SEO MANAGER</h1>
          <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0' }}>SEARCH ENGINE OPTIMIZATION SETTINGS</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#444', fontSize: 9, letterSpacing: 1.5, marginBottom: 4 }}>SEO SCORE</div>
            <div style={{ color: scoreColor, fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{score}<span style={{ fontSize: 12, fontWeight: 400, color: '#333' }}>/100</span></div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${scoreColor}` }}>
            <SEOIcon size={18} color={scoreColor} />
          </div>
          <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, background: saved ? '#22c55e' : '#e50914', border: 'none', borderRadius: 8, color: '#fff', padding: '10px 20px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}>
            {saved ? <><CheckIcon size={14} /> SAVED!</> : saving ? 'SAVING...' : 'SAVE SEO'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 28 }}>
        {([['meta','META TAGS'],['social','SOCIAL'],['analytics','ANALYTICS'],['sitemap','SITEMAP']] as const).map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', color: tab === t ? '#e50914' : '#555', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, padding: '10px 24px 12px', cursor: 'pointer', borderBottom: tab === t ? '2px solid #e50914' : '2px solid transparent', marginBottom: -1 }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'meta' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={labelStyle}>PAGE TITLE <span style={{ color: '#333' }}>({seo.title.length}/60)</span></label><input style={inputStyle} maxLength={60} value={seo.title} onChange={e => set('title', e.target.value)} /></div>
            <div><label style={labelStyle}>META DESCRIPTION <span style={{ color: '#333' }}>({seo.description.length}/160)</span></label><textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} maxLength={160} value={seo.description} onChange={e => set('description', e.target.value)} /></div>
            <div><label style={labelStyle}>KEYWORDS</label><input style={inputStyle} placeholder="STREAMING, MOVIES, DRAMA, ANIME, 4K..." value={seo.keywords} onChange={e => set('keywords', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={labelStyle}>CANONICAL URL</label><input style={inputStyle} placeholder="HTTPS://..." value={seo.canonical} onChange={e => set('canonical', e.target.value)} /></div>
              <div><label style={labelStyle}>ROBOTS</label><select style={inputStyle} value={seo.robots} onChange={e => set('robots', e.target.value)}><option value="index, follow">INDEX, FOLLOW</option><option value="noindex, nofollow">NOINDEX, NOFOLLOW</option><option value="index, nofollow">INDEX, NOFOLLOW</option></select></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'social' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={labelStyle}>OG TITLE</label><input style={inputStyle} value={seo.ogTitle} onChange={e => set('ogTitle', e.target.value)} /></div>
            <div><label style={labelStyle}>OG DESCRIPTION</label><textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={seo.ogDescription} onChange={e => set('ogDescription', e.target.value)} /></div>
            <div><label style={labelStyle}>OG IMAGE URL</label><input style={inputStyle} placeholder="HTTPS://... (1200x630 RECOMMENDED)" value={seo.ogImage} onChange={e => set('ogImage', e.target.value)} /></div>
            <div><label style={labelStyle}>TWITTER CARD TYPE</label><select style={inputStyle} value={seo.twitterCard} onChange={e => set('twitterCard', e.target.value)}><option value="summary_large_image">SUMMARY LARGE IMAGE</option><option value="summary">SUMMARY</option><option value="player">PLAYER</option></select></div>
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={labelStyle}>GOOGLE ANALYTICS ID</label><input style={inputStyle} placeholder="G-XXXXXXXXXX" value={seo.gaId} onChange={e => set('gaId', e.target.value)} /></div>
            <div><label style={labelStyle}>GOOGLE TAG MANAGER ID</label><input style={inputStyle} placeholder="GTM-XXXXXXX" value={seo.gtmId} onChange={e => set('gtmId', e.target.value)} /></div>
            <div><label style={labelStyle}>META PIXEL ID</label><input style={inputStyle} placeholder="XXXXXXXXXXXXXXXX" value={seo.pixelId} onChange={e => set('pixelId', e.target.value)} /></div>
          </div>
        </div>
      )}

      {tab === 'sitemap' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={labelStyle}>UPDATE FREQUENCY</label><select style={inputStyle} value={seo.sitemapFrequency} onChange={e => set('sitemapFrequency', e.target.value)}>{['always','hourly','daily','weekly','monthly','yearly','never'].map(f=><option key={f} value={f}>{f.toUpperCase()}</option>)}</select></div>
              <div><label style={labelStyle}>PRIORITY (0.0 — 1.0)</label><input style={inputStyle} type="number" min="0" max="1" step="0.1" value={seo.sitemapPriority} onChange={e => set('sitemapPriority', e.target.value)} /></div>
            </div>
            <div style={{ padding: '16px', background: '#111', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <RefreshIcon size={16} color="#4a9eff" />
              <div>
                <div style={{ color: '#ccc', fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>AUTO-GENERATED SITEMAP</div>
                <div style={{ color: '#444', fontSize: 10, letterSpacing: 0.5, marginTop: 3 }}>SITEMAP IS AUTOMATICALLY BUILT FROM YOUR CONTENT IN FIRESTORE</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = { background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginBottom: 20 };
const labelStyle: React.CSSProperties = { display: 'block', color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0.5, outline: 'none', boxSizing: 'border-box' };
