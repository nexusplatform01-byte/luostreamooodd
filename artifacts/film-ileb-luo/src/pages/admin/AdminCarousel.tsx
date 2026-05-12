import { useState, useEffect, useRef } from 'react';
import { getAllCarousel, addCarousel, updateCarousel, deleteCarousel, CarouselDoc, getAllContent, ContentDoc } from '../../lib/db';
import { uploadFile, getStoragePath } from '../../lib/storage';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, CheckIcon } from '../../components/Icons';

const empty = { image: '', title: '', description: '', contentId: '', isActive: true, order: 0 };

export default function AdminCarousel() {
  const [items, setItems] = useState<CarouselDoc[]>([]);
  const [content, setContent] = useState<ContentDoc[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imgPct, setImgPct] = useState(0);
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAll();
    getAllContent().then(setContent);
  }, []);

  const loadAll = () => getAllCarousel().then(setItems);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleImg = async (file: File) => {
    const url = await uploadFile(file, getStoragePath('thumbnail', file.name), p => setImgPct(p));
    set('image', url); setImgPct(0);
  };

  const save = async () => {
    if (!form.image) return;
    setSaving(true);
    try {
      if (editId) {
        await updateCarousel(editId, form);
      } else {
        await addCarousel({ ...form, order: items.length });
      }
      setForm(empty); setEditId(null); setShowForm(false);
      await loadAll();
    } finally { setSaving(false); }
  };

  const edit = (item: CarouselDoc) => {
    setForm({ image: item.image, title: item.title, description: item.description, contentId: item.contentId, isActive: item.isActive, order: item.order });
    setEditId(item.id!); setShowForm(true);
  };

  const del = async (id: string) => {
    if (confirm('DELETE THIS CAROUSEL ITEM?')) { await deleteCarousel(id); await loadAll(); }
  };

  const toggleActive = async (item: CarouselDoc) => {
    await updateCarousel(item.id!, { isActive: !item.isActive });
    await loadAll();
  };

  const linkedTitle = (contentId: string) => {
    const c = content.find(x => x.id === contentId);
    return c ? c.title : '—';
  };

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>CAROUSEL</h1>
          <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0' }}>{items.length} SLIDES · SHOWN ON HOME PAGE HERO BANNER</p>
        </div>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }} style={btnStyle('#e50914')}>
          <PlusIcon size={14} /> {showForm ? 'CANCEL' : 'ADD SLIDE'}
        </button>
      </div>

      {showForm && (
        <div style={cardStyle}>
          <h3 style={sectionTitle}>{editId ? 'EDIT SLIDE' : 'ADD NEW CAROUSEL SLIDE'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>SLIDE IMAGE *</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="HTTPS://... OR UPLOAD" value={form.image} onChange={e => set('image', e.target.value)} />
                <button onClick={() => imgRef.current?.click()} style={uploadBtn}><UploadIcon size={13} /></button>
                <input ref={imgRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleImg(e.target.files[0])} />
              </div>
              {imgPct > 0 && <div style={{ marginTop: 6, height: 4, background: '#222', borderRadius: 2 }}><div style={{ height: '100%', width: `${imgPct}%`, background: '#e50914', borderRadius: 2, transition: 'width 0.2s' }} /></div>}
              {form.image && <img src={form.image} style={{ marginTop: 8, width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} alt="" />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>TITLE (OPTIONAL)</label>
                <input style={inputStyle} placeholder="SLIDE TITLE" value={form.title} onChange={e => set('title', e.target.value.toUpperCase())} />
              </div>
              <div>
                <label style={labelStyle}>LINK TO CONTENT</label>
                <select style={inputStyle} value={form.contentId} onChange={e => set('contentId', e.target.value)}>
                  <option value="">— NO LINK —</option>
                  {content.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>DISPLAY ORDER</label>
                <input style={inputStyle} type="number" min="0" value={form.order} onChange={e => set('order', Number(e.target.value))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#111', borderRadius: 8 }}>
                <input type="checkbox" id="active" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                <label htmlFor="active" style={{ color: '#888', fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>SLIDE IS ACTIVE (VISIBLE ON SITE)</label>
              </div>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>DESCRIPTION (OPTIONAL)</label>
              <textarea style={{ ...inputStyle, height: 72, resize: 'vertical' }} placeholder="SLIDE DESCRIPTION..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={save} disabled={saving || !form.image} style={btnStyle('#e50914')}>
              <CheckIcon size={13} />{saving ? 'SAVING...' : (editId ? 'UPDATE SLIDE' : 'ADD SLIDE')}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }} style={btnStyle('#333')}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        {items.length === 0 ? (
          <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '24px 0', textAlign: 'center' }}>
            NO CAROUSEL SLIDES YET. THE SITE WILL SHOW DEFAULT SLIDES UNTIL YOU ADD YOUR OWN.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['ORDER', 'IMAGE', 'TITLE', 'LINKED CONTENT', 'STATUS', 'ACTIONS'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ ...tdStyle, color: '#fff', fontWeight: 700 }}>{item.order}</td>
                  <td style={tdStyle}>
                    {item.image
                      ? <img src={item.image} style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6 }} alt="" />
                      : <div style={{ width: 80, height: 50, background: '#222', borderRadius: 6 }} />}
                  </td>
                  <td style={{ ...tdStyle, color: '#fff', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title || <span style={{ color: '#333' }}>—</span>}
                  </td>
                  <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.contentId ? <span style={{ color: '#4a9eff', fontSize: 10 }}>{linkedTitle(item.contentId)}</span> : <span style={{ color: '#333' }}>—</span>}
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => toggleActive(item)} style={{ background: item.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(100,100,100,0.12)', color: item.isActive ? '#22c55e' : '#555', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 9, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                      {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => edit(item)} style={iconBtn('#4a9eff')}><EditIcon size={13} /></button>
                      <button onClick={() => del(item.id!)} style={iconBtn('#e50914')}><TrashIcon size={13} /></button>
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

const cardStyle: React.CSSProperties = { background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginBottom: 20 };
const sectionTitle: React.CSSProperties = { color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: '0 0 18px', fontFamily: 'Arial, sans-serif' };
const labelStyle: React.CSSProperties = { display: 'block', color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0.5, outline: 'none', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { color: '#333', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textAlign: 'left', padding: '0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'Arial, sans-serif' };
const tdStyle: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#888', fontSize: 11, fontFamily: 'Arial, sans-serif', paddingRight: 12 };
const btnStyle = (bg: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 6, background: bg, border: 'none', borderRadius: 8, color: '#fff', padding: '9px 18px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' });
const uploadBtn: React.CSSProperties = { background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#888', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 };
const iconBtn = (c: string): React.CSSProperties => ({ background: `${c}18`, border: 'none', borderRadius: 6, color: c, padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' });
