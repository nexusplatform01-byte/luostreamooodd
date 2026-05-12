import { useState, useEffect, useRef } from 'react';
import { subscribeContent, addContent, updateContent, deleteContent, ContentDoc } from '../../lib/db';
import { uploadFile, getStoragePath } from '../../lib/storage';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon } from '../../components/Icons';

const CATEGORIES = ['drama','anime','variety','short','kids','vip','documentary','sports','culture'];
const BADGES = ['EXCLUSIVE','HOT CHART TOP','VIP','NEW ARRIVAL','PREMIERE','UPDATED NEW','FREE NOW'];
const STATUS = ['ongoing','completed','upcoming'];
const HOME_SECTIONS = [
  { value: '', label: '— NONE —' },
  { value: 'keep-watching', label: 'KEEP WATCHING' },
  { value: 'trending', label: 'TRENDING NOW' },
  { value: 'new-arrivals', label: 'NEW ARRIVALS' },
  { value: 'top-drama', label: 'TOP DRAMAS' },
  { value: 'top-anime', label: 'TOP ANIME' },
  { value: 'top-movies', label: 'TOP MOVIES' },
  { value: 'vip-picks', label: 'VIP PICKS' },
  { value: 'featured', label: 'FEATURED' },
];
const empty = { title:'',description:'',category:'drama',thumbnail:'',year:'',totalEpisodes:'',rating:'',tags:'',badge:'EXCLUSIVE',isFeatured:false,status:'ongoing',homeSection:'' };

export default function AdminSeries() {
  const [series, setSeries] = useState<ContentDoc[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thumbPct, setThumbPct] = useState(0);
  const [search, setSearch] = useState('');
  const thumbRef = useRef<HTMLInputElement>(null);

  useEffect(() => subscribeContent('series', setSeries), []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleThumb = async (file: File) => {
    const url = await uploadFile(file, getStoragePath('thumbnail', file.name), p => setThumbPct(p));
    set('thumbnail', url); setThumbPct(0);
  };

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const data = { title:form.title, description:form.description, category:form.category, thumbnail:form.thumbnail, videoUrl:'', year:form.year, duration:'', rating:form.rating, tags:form.tags, badge:form.badge, isFeatured:form.isFeatured, status:form.status, totalEpisodes:form.totalEpisodes, language:'', isActive:true, homeSection:form.homeSection };
      if (editId) await updateContent(editId, { ...data, type:'series' });
      else await addContent({ ...data, type:'series' });
      setForm(empty); setEditId(null); setShowForm(false);
    } finally { setSaving(false); }
  };

  const edit = (s: ContentDoc) => {
    setForm({ title:s.title,description:s.description,category:s.category,thumbnail:s.thumbnail,year:s.year,totalEpisodes:s.totalEpisodes||'',rating:s.rating,tags:s.tags,badge:s.badge,isFeatured:s.isFeatured,status:s.status||'ongoing',homeSection:s.homeSection||'' });
    setEditId(s.id!); setShowForm(true);
  };
  const del = async (id: string) => { if (confirm('DELETE THIS SERIES?')) await deleteContent(id); };

  const filtered = series.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>TV SERIES</h1>
          <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0' }}>{series.length} SERIES IN LIBRARY</p>
        </div>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }} style={btnStyle('#e50914')}>
          <PlusIcon size={14} /> {showForm ? 'CANCEL' : 'ADD SERIES'}
        </button>
      </div>

      {showForm && (
        <div style={cardStyle}>
          <h3 style={sectionTitle}>{editId ? 'EDIT SERIES' : 'ADD NEW SERIES'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>TITLE *</label><input style={inputStyle} placeholder="SERIES TITLE" value={form.title} onChange={e => set('title', e.target.value.toUpperCase())} /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>DESCRIPTION</label><textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="DESCRIPTION..." value={form.description} onChange={e => set('description', e.target.value)} /></div>
            <div><label style={labelStyle}>CATEGORY</label><select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}</select></div>
            <div><label style={labelStyle}>STATUS</label><select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>{STATUS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}</select></div>
            <div><label style={labelStyle}>BADGE</label><select style={inputStyle} value={form.badge} onChange={e => set('badge', e.target.value)}>{BADGES.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
            <div><label style={labelStyle}>TOTAL EPISODES</label><input style={inputStyle} placeholder="24" value={form.totalEpisodes} onChange={e => set('totalEpisodes', e.target.value)} /></div>
            <div><label style={labelStyle}>YEAR</label><input style={inputStyle} placeholder="2025" value={form.year} onChange={e => set('year', e.target.value)} /></div>
            <div><label style={labelStyle}>RATING</label><input style={inputStyle} placeholder="9.2" value={form.rating} onChange={e => set('rating', e.target.value)} /></div>
            <div><label style={labelStyle}>TAGS</label><input style={inputStyle} placeholder="ROMANCE, THRILLER" value={form.tags} onChange={e => set('tags', e.target.value.toUpperCase())} /></div>
            <div>
              <label style={labelStyle}>THUMBNAIL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="HTTPS://... OR UPLOAD" value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} />
                <button onClick={() => thumbRef.current?.click()} style={uploadBtn}><UploadIcon size={13} /></button>
                <input ref={thumbRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleThumb(e.target.files[0])} />
              </div>
              {thumbPct > 0 && <ProgressBar pct={thumbPct} />}
            </div>
            <div>
              <label style={labelStyle}>HOME PAGE SECTION</label>
              <select style={inputStyle} value={form.homeSection} onChange={e => set('homeSection', e.target.value)}>
                {HOME_SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'flex-end', padding: '10px 0' }}>
              <input type="checkbox" id="feat" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
              <label htmlFor="feat" style={{ color: '#888', fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>FEATURE ON HOMEPAGE BANNER</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={save} disabled={saving || !form.title} style={btnStyle('#e50914')}>{saving ? 'SAVING...' : (editId ? 'UPDATE SERIES' : 'ADD SERIES')}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }} style={btnStyle('#333')}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <input style={{ ...inputStyle, maxWidth: 320 }} placeholder="SEARCH SERIES..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={cardStyle}>
        {filtered.length === 0 ? (
          <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '24px 0', textAlign: 'center' }}>NO SERIES FOUND. ADD YOUR FIRST SERIES ABOVE.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['THUMBNAIL','TITLE','CATEGORY','STATUS','EPS','BADGE','ACTIONS'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={tdStyle}>{s.thumbnail ? <img src={s.thumbnail} style={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 4 }} alt="" /> : <div style={{ width: 56, height: 36, background: '#222', borderRadius: 4 }} />}</td>
                  <td style={{ ...tdStyle, color: '#fff', fontWeight: 700, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</td>
                  <td style={tdStyle}><span style={badge('#4a9eff')}>{s.category.toUpperCase()}</span></td>
                  <td style={tdStyle}><span style={badge(s.status==='completed'?'#22c55e':s.status==='upcoming'?'#f5a623':'#4a9eff')}>{(s.status||'ONGOING').toUpperCase()}</span></td>
                  <td style={tdStyle}>{s.totalEpisodes||'—'}</td>
                  <td style={tdStyle}><span style={badge('#666')}>{s.badge}</span></td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => edit(s)} style={iconBtn('#4a9eff')}><EditIcon size={13} /></button>
                      <button onClick={() => del(s.id!)} style={iconBtn('#e50914')}><TrashIcon size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return <div style={{ marginTop: 6, height: 4, background: '#222', borderRadius: 2 }}><div style={{ height: '100%', width: `${pct}%`, background: '#e50914', borderRadius: 2, transition: 'width 0.2s' }} /></div>;
}

const cardStyle: React.CSSProperties = { background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginBottom: 20 };
const sectionTitle: React.CSSProperties = { color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: '0 0 18px' };
const labelStyle: React.CSSProperties = { display: 'block', color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0.5, outline: 'none', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { color: '#333', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textAlign: 'left', padding: '0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' };
const tdStyle: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#888', fontSize: 11, paddingRight: 12 };
const btnStyle = (bg: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 6, background: bg, border: 'none', borderRadius: 8, color: '#fff', padding: '9px 18px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' });
const uploadBtn: React.CSSProperties = { background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#888', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 };
const iconBtn = (c: string): React.CSSProperties => ({ background: `${c}18`, border: 'none', borderRadius: 6, color: c, padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' });
const badge = (c: string): React.CSSProperties => ({ background: `${c}18`, color: c, fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '2px 7px', borderRadius: 4 });
