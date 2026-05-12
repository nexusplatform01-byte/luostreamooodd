import { useState, useEffect, useRef } from 'react';
import { subscribeContent, addContent, updateContent, deleteContent, ContentDoc } from '../../lib/db';
import { uploadFile, getStoragePath } from '../../lib/storage';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon } from '../../components/Icons';

const CATEGORIES = ['drama','anime','movies','variety','short','kids','vip','documentary','sports','culture'];
const BADGES = ['FREE NOW','EXCLUSIVE','HOT CHART TOP','VIP','NEW ARRIVAL','PREMIERE','UPDATED NEW'];
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
const empty = { title:'',description:'',category:'drama',thumbnail:'',videoUrl:'',year:'',duration:'',rating:'',tags:'',badge:'FREE NOW',isFeatured:false,homeSection:'' };

export default function AdminMovies() {
  const [movies, setMovies] = useState<ContentDoc[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thumbPct, setThumbPct] = useState(0);
  const [vidPct, setVidPct] = useState(0);
  const [search, setSearch] = useState('');
  const thumbRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  useEffect(() => subscribeContent('movie', setMovies), []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleThumb = async (file: File) => {
    const url = await uploadFile(file, getStoragePath('thumbnail', file.name), p => setThumbPct(p));
    set('thumbnail', url); setThumbPct(0);
  };
  const handleVid = async (file: File) => {
    const url = await uploadFile(file, getStoragePath('video', file.name), p => setVidPct(p));
    set('videoUrl', url); setVidPct(0);
  };

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      if (editId) { await updateContent(editId, { ...form, type: 'movie' }); }
      else { await addContent({ ...form, type: 'movie', language: '', status: '', totalEpisodes: '', isActive: true }); }
      setForm(empty); setEditId(null); setShowForm(false);
    } finally { setSaving(false); }
  };

  const edit = (m: ContentDoc) => { setForm({ title:m.title,description:m.description,category:m.category,thumbnail:m.thumbnail,videoUrl:m.videoUrl,year:m.year,duration:m.duration,rating:m.rating,tags:m.tags,badge:m.badge,isFeatured:m.isFeatured,homeSection:m.homeSection||'' }); setEditId(m.id!); setShowForm(true); };
  const del = async (id: string) => { if (confirm('DELETE THIS MOVIE?')) await deleteContent(id); };

  const filtered = movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>MOVIES</h1>
          <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0' }}>{movies.length} MOVIES IN LIBRARY</p>
        </div>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }} style={btnStyle('#e50914')}>
          <PlusIcon size={14} /> {showForm ? 'CANCEL' : 'ADD MOVIE'}
        </button>
      </div>

      {showForm && (
        <div style={cardStyle}>
          <h3 style={sectionTitle}>{editId ? 'EDIT MOVIE' : 'ADD NEW MOVIE'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>TITLE *</label><input style={inputStyle} placeholder="MOVIE TITLE" value={form.title} onChange={e => set('title', e.target.value.toUpperCase())} /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>DESCRIPTION</label><textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="DESCRIPTION..." value={form.description} onChange={e => set('description', e.target.value)} /></div>
            <div><label style={labelStyle}>CATEGORY</label><select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}</select></div>
            <div><label style={labelStyle}>BADGE</label><select style={inputStyle} value={form.badge} onChange={e => set('badge', e.target.value)}>{BADGES.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
            <div><label style={labelStyle}>YEAR</label><input style={inputStyle} placeholder="2025" value={form.year} onChange={e => set('year', e.target.value)} /></div>
            <div><label style={labelStyle}>DURATION</label><input style={inputStyle} placeholder="2H 15M" value={form.duration} onChange={e => set('duration', e.target.value.toUpperCase())} /></div>
            <div><label style={labelStyle}>RATING</label><input style={inputStyle} placeholder="8.5" value={form.rating} onChange={e => set('rating', e.target.value)} /></div>
            <div><label style={labelStyle}>TAGS</label><input style={inputStyle} placeholder="ACTION, THRILLER" value={form.tags} onChange={e => set('tags', e.target.value.toUpperCase())} /></div>

            <div>
              <label style={labelStyle}>THUMBNAIL</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="HTTPS://... OR UPLOAD" value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} />
                <button onClick={() => thumbRef.current?.click()} style={uploadBtn}><UploadIcon size={13} /></button>
                <input ref={thumbRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleThumb(e.target.files[0])} />
              </div>
              {thumbPct > 0 && <ProgressBar pct={thumbPct} />}
            </div>
            <div>
              <label style={labelStyle}>VIDEO URL / MUX PLAYBACK ID</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="HTTPS://... OR MUX PLAYBACK ID" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} />
                <button onClick={() => vidRef.current?.click()} style={uploadBtn}><UploadIcon size={13} /></button>
                <input ref={vidRef} type="file" accept="video/*" hidden onChange={e => e.target.files?.[0] && handleVid(e.target.files[0])} />
              </div>
              {vidPct > 0 && <ProgressBar pct={vidPct} />}
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
            <button onClick={save} disabled={saving || !form.title} style={btnStyle('#e50914')}>{saving ? 'SAVING...' : (editId ? 'UPDATE MOVIE' : 'ADD MOVIE')}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }} style={btnStyle('#333')}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <input style={{ ...inputStyle, maxWidth: 320 }} placeholder="SEARCH MOVIES..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={cardStyle}>
        {filtered.length === 0 ? (
          <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '24px 0', textAlign: 'center' }}>NO MOVIES FOUND. ADD YOUR FIRST MOVIE ABOVE.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['THUMBNAIL','TITLE','CATEGORY','BADGE','YEAR','FEATURED','ACTIONS'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td style={tdStyle}>{m.thumbnail ? <img src={m.thumbnail} style={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 4 }} alt="" /> : <div style={{ width: 56, height: 36, background: '#222', borderRadius: 4 }} />}</td>
                  <td style={{ ...tdStyle, color: '#fff', fontWeight: 700, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</td>
                  <td style={tdStyle}><span style={badge('#4a9eff')}>{m.category.toUpperCase()}</span></td>
                  <td style={tdStyle}><span style={badge('#666')}>{m.badge}</span></td>
                  <td style={tdStyle}>{m.year || '—'}</td>
                  <td style={tdStyle}>{m.isFeatured ? <span style={badge('#22c55e')}>YES</span> : <span style={{ color: '#333', fontSize: 10 }}>NO</span>}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => edit(m)} style={iconBtn('#4a9eff')}><EditIcon size={13} /></button>
                      <button onClick={() => del(m.id!)} style={iconBtn('#e50914')}><TrashIcon size={13} /></button>
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
const sectionTitle: React.CSSProperties = { color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: '0 0 18px', fontFamily: 'Arial, sans-serif' };
const labelStyle: React.CSSProperties = { display: 'block', color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0.5, outline: 'none', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { color: '#333', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textAlign: 'left', padding: '0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'Arial, sans-serif' };
const tdStyle: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#888', fontSize: 11, fontFamily: 'Arial, sans-serif', paddingRight: 12 };
const btnStyle = (bg: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 6, background: bg, border: 'none', borderRadius: 8, color: '#fff', padding: '9px 18px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' });
const uploadBtn: React.CSSProperties = { background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#888', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 };
const iconBtn = (c: string): React.CSSProperties => ({ background: `${c}18`, border: 'none', borderRadius: 6, color: c, padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' });
const badge = (c: string): React.CSSProperties => ({ background: `${c}18`, color: c, fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '2px 7px', borderRadius: 4 });
