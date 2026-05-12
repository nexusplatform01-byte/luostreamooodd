import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginModal() {
  const { loginModalOpen, loginTab, closeLogin, openLogin, loginWithEmailOrPhone, registerUser, loginWithGoogle } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>(loginTab);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTab(loginTab); }, [loginTab]);

  if (!loginModalOpen) return null;

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    if (!form.phone || !form.password) { setError('PLEASE FILL IN ALL FIELDS'); return; }
    setLoading(true); setError('');
    try {
      await loginWithEmailOrPhone(form.phone, form.password);
      closeLogin();
    } catch (e: any) {
      const msg = e.message || '';
      if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        setError('INCORRECT PHONE NUMBER / EMAIL OR PASSWORD');
      } else if (msg.includes('NO ACCOUNT FOUND')) {
        setError(msg);
      } else {
        setError('LOGIN FAILED. PLEASE TRY AGAIN.');
      }
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) { setError('PLEASE FILL IN ALL FIELDS'); return; }
    if (!form.email.includes('@')) { setError('PLEASE ENTER A VALID EMAIL ADDRESS'); return; }
    if (form.password.length < 6) { setError('PASSWORD MUST BE AT LEAST 6 CHARACTERS'); return; }
    setLoading(true); setError('');
    try {
      await registerUser(form.name.toUpperCase(), form.email, form.phone, form.password);
      closeLogin();
    } catch (e: any) {
      const msg = e.message || '';
      if (msg.includes('email-already-in-use')) { setError('EMAIL ALREADY REGISTERED'); }
      else if (msg.includes('PHONE NUMBER ALREADY')) { setError(msg); }
      else { setError('REGISTRATION FAILED. PLEASE TRY AGAIN.'); }
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      await loginWithGoogle();
      closeLogin();
    } catch (e: any) {
      if (!e.message?.includes('popup-closed')) setError('GOOGLE LOGIN FAILED. PLEASE TRY AGAIN.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={closeLogin} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', background: '#1a1a1a', borderRadius: 16, width: 400, maxWidth: '95vw', padding: '32px 32px 28px', boxShadow: '0 24px 80px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={closeLogin} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 20, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 22, fontWeight: 900, letterSpacing: 2 }}>
            <span style={{ color: '#e50914' }}>FILM ILEB</span>
            <span style={{ color: '#fff' }}> LUO</span>
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
          {(['login', 'register'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }} style={{ flex: 1, background: 'none', border: 'none', color: tab === t ? '#e50914' : '#888', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, padding: '10px 0', cursor: 'pointer', borderBottom: tab === t ? '2px solid #e50914' : '2px solid transparent', marginBottom: -1 }}>
              {t === 'login' ? 'LOG IN' : 'REGISTER'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#e50914', fontSize: 11, fontFamily: 'Arial, sans-serif', letterSpacing: 0.8 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tab === 'register' && <>
            <input placeholder="FULL NAME" value={form.name} onChange={e => set('name', e.target.value)} style={inp} />
            <input placeholder="EMAIL ADDRESS" type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inp} />
          </>}
          <input placeholder={tab === 'login' ? 'PHONE NUMBER OR EMAIL' : 'PHONE NUMBER'} type={tab === 'login' ? 'text' : 'tel'} value={form.phone} onChange={e => set('phone', e.target.value)} style={inp} />
          <input placeholder="PASSWORD" type="password" value={form.password} onChange={e => set('password', e.target.value)} style={inp} onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleRegister())} />
        </div>

        <button onClick={tab === 'login' ? handleLogin : handleRegister} disabled={loading} style={{ width: '100%', marginTop: 20, padding: '13px', background: loading ? '#444' : 'linear-gradient(135deg,#e50914,#c0000a)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'PLEASE WAIT...' : (tab === 'login' ? 'LOG IN' : 'CREATE ACCOUNT')}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: '#555', fontSize: 11, fontFamily: 'Arial, sans-serif', letterSpacing: 1 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', padding: '12px', background: '#fff', border: 'none', borderRadius: 10, color: '#222', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          CONTINUE WITH GOOGLE
        </button>

        {tab === 'login' ? (
          <p style={{ textAlign: 'center', marginTop: 16, color: '#666', fontSize: 11, fontFamily: 'Arial, sans-serif', letterSpacing: 0.8 }}>
            NO ACCOUNT?{' '}
            <span onClick={() => { setTab('register'); setError(''); }} style={{ color: '#e50914', cursor: 'pointer', fontWeight: 700 }}>REGISTER NOW</span>
          </p>
        ) : (
          <p style={{ textAlign: 'center', marginTop: 16, color: '#666', fontSize: 11, fontFamily: 'Arial, sans-serif', letterSpacing: 0.8 }}>
            ALREADY HAVE AN ACCOUNT?{' '}
            <span onClick={() => { setTab('login'); setError(''); }} style={{ color: '#e50914', cursor: 'pointer', fontWeight: 700 }}>LOG IN</span>
          </p>
        )}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { width: '100%', padding: '13px 16px', background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 12, letterSpacing: 1, outline: 'none', boxSizing: 'border-box' };
