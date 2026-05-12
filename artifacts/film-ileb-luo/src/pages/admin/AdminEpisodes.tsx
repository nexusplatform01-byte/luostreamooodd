import { useState, useEffect, useRef } from 'react';
import { getContent, getEpisodes, addEpisode, updateEpisode, deleteEpisode, EpisodeDoc, ContentDoc } from '../../lib/db';
import { uploadFile, getStoragePath } from '../../lib/storage';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon } from '../../components/Icons';

const empty = { seriesId:'', title:'', episodeNumber:'', description:'', videoUrl:'', thumbnail:'', duration:'', isFree:true };

export default function AdminEpisodes() {
  const [episodes, setEpisodes] = useState<EpisodeDoc[]>([]);
  const [series, setSeries] = useState<ContentDoc[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thumbPct, setThumbPct] = useState(0);
  const [vidPct, setVidPct] = useState(0);
  const [filterSeries, setFilterSeries] = useState('all');
  const thumbRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getContent('series').then(setSeries); }, []);
  useEffect(() => { getEpisodes().then(setEpisodes); }, []);

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
    if (!form.title || !form.seriesId) return;
    setSaving(true);
    try {
      const data = { seriesId:form.seriesId, title:form.title, episodeNumber:Number(form.episodeNumber)||1, description:form.description, videoUrl:form.videoUrl, thumbnail:form.thumbnail, duration:form.duration, isFree:form.isFree };
      if (editId) { await updateEpisode(editId, data); setEpisodes(eps => eps.map(e => e.id===editId?{...e,...data}:e)); }
      else { const id = await addEpisode(data); setEpisodes(eps => [...eps, { id, ...data, createdAt: null as any }]); }
      setForm(empty); setEditId(null); setShowForm(false);
    } finally { setSaving(false); }
  };

  const edit = (ep: EpisodeDoc) => {
    setForm({ seriesId:ep.seriesId, title:ep.title, episodeNumber:String(ep.episodeNumber), description:ep.description, videoUrl:ep.videoUrl, thumbnail:ep.thumbnail, duration:ep.duration, isFree:ep.isFree });
    setEditId(ep.id!); setShowForm(true);
  };
  const del = async (id: string) => { if (confirm('DELETE THIS EPISODE?')) { await deleteEpisode(id); setEpisodes(eps => eps.filter(e => e.id!==id)); } };

  const getSeriesTitle = (id: string) => series.find(s => s.id===id)?.title || id;
  const filtered = filterSeries==='all' ? episodes : episodes.filter(e => e.seriesId===filterSeries);

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>EPISODES</h1>
          <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0' }}>{episodes.length} EPISODES TOTAL</p>
        </div>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }} style={btnStyle('#e50914')}>
          <PlusIcon size={14} /> {showForm ? 'CANCEL' : 'ADD EPISODE'}
        </button>
      </div>

      {showForm && (
        <div style={cardStyle}>
          <h3 style={sectionTitle}>{editId ? 'EDIT EPISODE' : 'ADD NEW EPISODE'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={labelStyle}>SERIES *</label><select style={inputStyle} value={form.seriesId} onChange={e => set('seriesId', e.target.value)}><option value="">SELECT SERIES...</option>{series.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
            <div><label style={labelStyle}>EPISODE NUMBER</label><input style={inputStyle} type="number" placeholder="1" value={form.episodeNumber} onChange={e => set('episodeNumber', e.target.value)} /></div>
            <div><label style={labelStyle}>TITLE *</label><input style={inputStyle} placeholder="EPISODE TITLE" value={form.title} onChange={e => set('title', e.target.value.toUpperCase())} /></div>
            <div><label style={labelStyle}>DURATION</label><input style={inputStyle} placeholder="45M" value={form.duration} onChange={e => set('duration', e.target.value.toUpperCase())} /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>DESCRIPTION</label><textarea style={{ ...inputStyle, height: 70, resize: 'vertical' }} placeholder="EPISODE DESCRIPTION..." value={form.description} onChange={e => set('description', e.target.value)} /></div>
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
              <label style={labelStyle}>VIDEO URL / MUX PLAYBACK ID</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="HTTPS://... OR MUX ID" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} />
                <button onClick={() => vidRef.current?.click()} style={uploadBtn}><UploadIcon size={13} /></button>
                <input ref={vidRef} type="file" accept="video/*" hidden onChange={e => e.target.files?.[0] && handleVid(e.target.files[0])} />
              </div>
              {vidPct > 0 && <ProgressBar pct={vidPct} />}
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="freeEp" checked={form.isFree} onChange={e => set('isFree', e.target.checked)} />
              <label htmlFor="freeEp" style={{ color: '#888', fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>FREE TO WATCH (NO VIP REQUIRED)</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={save} disabled={saving || !form.title || !form.seriesId} style={btnStyle('#e50914')}>{saving ? 'SAVING...' : (editId ? 'UPDATE EPISODE' : 'ADD EPISODE')}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }} style={btnStyle('#333')}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <select style={{ ...inputStyle, maxWidth: 280 }} value={filterSeries} onChange={e => setFilterSeries(e.target.value)}>
          <option value="all">ALL SERIES</option>
          {series.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>

      <div style={cardStyle}>
        {filtered.length === 0 ? (
          <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '24px 0', textAlign: 'center' }}>NO EPISODES FOUND. ADD YOUR FIRST EPISODE ABOVE.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['EP','TITLE','SERIES','DURATION','FREE','ACTIONS'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(ep => (
                <tr key={ep.id}>
                  <td style={{ ...tdStyle, color: '#e50914', fontWeight: 700 }}>{ep.episodeNumber}</td>
                  <td style={{ ...tdStyle, color: '#fff', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.title}</td>
                  <td style={{ ...tdStyle, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getSeriesTitle(ep.seriesId)}</td>
                  <td style={tdStyle}>{ep.duration||'—'}</td>
                  <td style={tdStyle}>{ep.isFree ? <span style={badge('#22c55e')}>FREE</span> : <span style={badge('#f5a623')}>VIP</span>}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => edit(ep)} style={iconBtn('#4a9eff')}><EditIcon size={13} /></button>
                      <button onClick={() => del(ep.id!)} style={iconBtn('#e50914')}><TrashIcon size={13} /></button>
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
