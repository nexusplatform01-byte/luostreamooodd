import { useState, useEffect, useRef } from 'react';
import { subscribeContent, addContent, updateContent, deleteContent, ContentDoc } from '../../lib/db';
import { uploadFile, getStoragePath } from '../../lib/storage';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, SignalIcon } from '../../components/Icons';

const LANGUAGES = ['ENGLISH','CHINESE','JAPANESE','KOREAN','ARABIC','FRENCH','SPANISH','HINDI','THAI','OTHER'];
const empty = { name:'', description:'', category:'live', streamUrl:'', thumbnail:'', language:'ENGLISH', isActive:true, badge:'LIVE' };

export default function AdminLive() {
  const [channels, setChannels] = useState<ContentDoc[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thumbPct, setThumbPct] = useState(0);
  const thumbRef = useRef<HTMLInputElement>(null);

  useEffect(() => subscribeContent('live', setChannels), []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleThumb = async (file: File) => {
    const url = await uploadFile(file, getStoragePath('thumbnail', file.name), p => setThumbPct(p));
    set('thumbnail', url); setThumbPct(0);
  };

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const data = { title:form.name, description:form.description, category:'live', thumbnail:form.thumbnail, videoUrl:form.streamUrl, year:'', duration:'', rating:'', tags:'', badge:form.badge, isFeatured:false, status:'', totalEpisodes:'', language:form.language, isActive:form.isActive };
      if (editId) await updateContent(editId, { ...data, type:'live' });
      else await addContent({ ...data, type:'live' });
      setForm(empty); setEditId(null); setShowForm(false);
    } finally { setSaving(false); }
  };

  const edit = (ch: ContentDoc) => {
    setForm({ name:ch.title, description:ch.description, category:'live', streamUrl:ch.videoUrl, thumbnail:ch.thumbnail, language:ch.language||'ENGLISH', isActive:ch.isActive, badge:ch.badge });
    setEditId(ch.id!); setShowForm(true);
  };
  const del = async (id: string) => { if (confirm('DELETE THIS CHANNEL?')) await deleteContent(id); };
  const toggle = async (ch: ContentDoc) => { await updateContent(ch.id!, { isActive: !ch.isActive }); };

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>LIVE CHANNELS</h1>
          <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0' }}>{channels.length} CHANNELS · {channels.filter(c=>c.isActive).length} LIVE NOW</p>
        </div>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }} style={btnStyle('#e50914')}>
          <PlusIcon size={14} /> {showForm ? 'CANCEL' : 'ADD CHANNEL'}
        </button>
      </div>

      {showForm && (
        <div style={cardStyle}>
          <h3 style={sectionTitle}>{editId ? 'EDIT CHANNEL' : 'ADD LIVE CHANNEL'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>CHANNEL NAME *</label><input style={inputStyle} placeholder="CHANNEL NAME" value={form.name} onChange={e => set('name', e.target.value.toUpperCase())} /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>DESCRIPTION</label><textarea style={{ ...inputStyle, height: 70, resize: 'vertical' }} placeholder="CHANNEL DESCRIPTION..." value={form.description} onChange={e => set('description', e.target.value)} /></div>
            <div><label style={labelStyle}>LANGUAGE</label><select style={inputStyle} value={form.language} onChange={e => set('language', e.target.value)}>{LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
            <div><label style={labelStyle}>BADGE</label><input style={inputStyle} placeholder="LIVE, 4K, HD, etc." value={form.badge} onChange={e => set('badge', e.target.value.toUpperCase())} /></div>
            <div>
              <label style={labelStyle}>THUMBNAIL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="HTTPS://..." value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} />
                <button onClick={() => thumbRef.current?.click()} style={uploadBtn}><UploadIcon size={13} /></button>
                <input ref={thumbRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleThumb(e.target.files[0])} />
              </div>
              {thumbPct > 0 && <ProgressBar pct={thumbPct} />}
            </div>
            <div><label style={labelStyle}>STREAM URL (HLS / RTMP)</label><input style={inputStyle} placeholder="HTTPS://STREAM.M3U8" value={form.streamUrl} onChange={e => set('streamUrl', e.target.value)} /></div>
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="active" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
              <label htmlFor="active" style={{ color: '#888', fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>CHANNEL IS CURRENTLY LIVE / ACTIVE</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={save} disabled={saving || !form.name} style={btnStyle('#e50914')}>{saving ? 'SAVING...' : (editId ? 'UPDATE CHANNEL' : 'ADD CHANNEL')}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }} style={btnStyle('#333')}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {channels.length === 0 ? (
          <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '24px 0', fontFamily: 'Arial, sans-serif' }}>NO CHANNELS YET. ADD YOUR FIRST CHANNEL ABOVE.</div>
        ) : channels.map(ch => (
          <div key={ch.id} style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              {ch.thumbnail ? <img src={ch.thumbnail} style={{ width: '100%', height: 120, objectFit: 'cover' }} alt="" /> : <div style={{ width: '100%', height: 120, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SignalIcon size={32} color="#333" /></div>}
              <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <button onClick={() => toggle(ch)} style={{ background: ch.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(100,100,100,0.2)', border: `1px solid ${ch.isActive?'#22c55e':'#444'}`, borderRadius: 20, color: ch.isActive?'#22c55e':'#666', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, padding: '3px 10px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                  {ch.isActive ? 'LIVE' : 'OFFLINE'}
                </button>
              </div>
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.title}</div>
              <div style={{ color: '#444', fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>{ch.language||'ENGLISH'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => edit(ch)} style={iconBtn('#4a9eff')}><EditIcon size={13} /></button>
                <button onClick={() => del(ch.id!)} style={iconBtn('#e50914')}><TrashIcon size={13} /></button>
              </div>
            </div>
          </div>
        ))}
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
const btnStyle = (bg: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 6, background: bg, border: 'none', borderRadius: 8, color: '#fff', padding: '9px 18px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' });
const uploadBtn: React.CSSProperties = { background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#888', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 };
const iconBtn = (c: string): React.CSSProperties => ({ background: `${c}18`, border: 'none', borderRadius: 6, color: c, padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' });
