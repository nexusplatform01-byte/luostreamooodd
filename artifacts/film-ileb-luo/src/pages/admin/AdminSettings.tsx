import { useState, useEffect } from 'react';
import { getSiteSettings, saveSiteSettings, SiteSettingsDoc } from '../../lib/db';
import { SettingsIcon, CheckIcon, BellIcon, ShieldIcon } from '../../components/Icons';

export default function AdminSettings() {
  const [site, setSite] = useState<SiteSettingsDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'general'|'notifications'|'security'>('general');

  useEffect(() => { getSiteSettings().then(setSite); }, []);

  const save = async () => {
    if (!site) return;
    setSaving(true);
    try {
      await saveSiteSettings(site);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const setSiteField = (k: keyof SiteSettingsDoc, v: any) => setSite(s => s ? { ...s, [k]: v } : s);
  const setNotif = (k: string, v: boolean) => setSite(s => s ? { ...s, notifications: { ...s.notifications, [k]: v } } : s);

  if (!site) return <div style={{ padding: 40, color: '#444', fontFamily: 'Arial, sans-serif', fontSize: 12, letterSpacing: 1 }}>LOADING SETTINGS...</div>;

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>SETTINGS</h1>
          <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0' }}>CONFIGURE YOUR PLATFORM</p>
        </div>
        <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, background: saved ? '#22c55e' : '#e50914', border: 'none', borderRadius: 8, color: '#fff', padding: '10px 20px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}>
          {saved ? <><CheckIcon size={14} /> SAVED!</> : <><SettingsIcon size={14} /> {saving ? 'SAVING...' : 'SAVE SETTINGS'}</>}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 28 }}>
        {([['general','GENERAL'], ['notifications','NOTIFICATIONS'], ['security','SECURITY']] as const).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', color: tab === t ? '#e50914' : '#555', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, padding: '10px 24px 12px', cursor: 'pointer', borderBottom: tab === t ? '2px solid #e50914' : '2px solid transparent', marginBottom: -1 }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <SettingsIcon size={14} color="#e50914" />
            <h3 style={sectionTitle}>SITE INFORMATION</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={labelStyle}>SITE NAME</label><input style={inputStyle} value={site.name} onChange={e => setSiteField('name', e.target.value.toUpperCase())} /></div>
            <div><label style={labelStyle}>TAGLINE</label><input style={inputStyle} value={site.tagline} onChange={e => setSiteField('tagline', e.target.value.toUpperCase())} /></div>
            <div><label style={labelStyle}>LOGO URL</label><input style={inputStyle} placeholder="HTTPS://..." value={site.logo} onChange={e => setSiteField('logo', e.target.value)} /></div>
            <div><label style={labelStyle}>PRIMARY COLOR</label><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input style={inputStyle} value={site.primaryColor} onChange={e => setSiteField('primaryColor', e.target.value)} /><input type="color" value={site.primaryColor} onChange={e => setSiteField('primaryColor', e.target.value)} style={{ width: 42, height: 42, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent' }} /></div></div>
            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>FOOTER TEXT</label><input style={inputStyle} value={site.footerText} onChange={e => setSiteField('footerText', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '14px 16px', background: '#111', borderRadius: 10 }}>
            <input type="checkbox" id="maint" checked={site.maintenance} onChange={e => setSiteField('maintenance', e.target.checked)} />
            <label htmlFor="maint" style={{ color: site.maintenance ? '#f5a623' : '#666', fontSize: 11, letterSpacing: 1, cursor: 'pointer', fontWeight: site.maintenance ? 700 : 400 }}>
              MAINTENANCE MODE {site.maintenance ? '— SITE IS CURRENTLY OFFLINE FOR USERS' : ''}
            </label>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <BellIcon size={14} color="#e50914" />
            <h3 style={sectionTitle}>NOTIFICATION SETTINGS</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'emailNewUser', label: 'EMAIL ON NEW USER REGISTRATION', sub: 'RECEIVE AN EMAIL WHEN A NEW USER SIGNS UP' },
              { key: 'emailNewSub', label: 'EMAIL ON NEW SUBSCRIPTION', sub: 'RECEIVE AN EMAIL WHEN A VIP SUBSCRIPTION IS PURCHASED' },
              { key: 'emailWithdrawal', label: 'EMAIL ON WITHDRAWAL REQUEST', sub: 'RECEIVE AN EMAIL WHEN A WITHDRAWAL IS PROCESSED' },
              { key: 'smsAlerts', label: 'SMS ALERTS', sub: 'RECEIVE SMS NOTIFICATIONS FOR CRITICAL EVENTS' },
            ].map(({ key, label, sub }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#111', borderRadius: 10 }}>
                <div>
                  <div style={{ color: '#ccc', fontSize: 12, fontWeight: 700, letterSpacing: 0.8, marginBottom: 3 }}>{label}</div>
                  <div style={{ color: '#444', fontSize: 10, letterSpacing: 0.5 }}>{sub}</div>
                </div>
                <button onClick={() => setNotif(key, !(site.notifications as any)[key])} style={{ width: 44, height: 24, borderRadius: 12, background: (site.notifications as any)[key] ? '#e50914' : '#222', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: (site.notifications as any)[key] ? 23 : 3, transition: 'left 0.2s' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <ShieldIcon size={14} color="#e50914" />
            <h3 style={sectionTitle}>SECURITY INFORMATION</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'AUTHENTICATION PROVIDER', value: 'FIREBASE AUTH (GOOGLE / EMAIL+PASSWORD)' },
              { label: 'DATABASE', value: 'FIREBASE FIRESTORE (CLOUD)' },
              { label: 'FILE STORAGE', value: 'FIREBASE STORAGE' },
              { label: 'SESSION MANAGEMENT', value: 'FIREBASE AUTH PERSISTENCE (LOCAL)' },
              { label: 'PROJECT ID', value: 'film-ileb-luo' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#111', borderRadius: 10 }}>
                <span style={{ color: '#555', fontSize: 11, letterSpacing: 1 }}>{label}</span>
                <span style={{ color: '#ccc', fontSize: 11, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = { background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginBottom: 20 };
const sectionTitle: React.CSSProperties = { color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: 0, fontFamily: 'Arial, sans-serif' };
const labelStyle: React.CSSProperties = { display: 'block', color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0.5, outline: 'none', boxSizing: 'border-box' };
