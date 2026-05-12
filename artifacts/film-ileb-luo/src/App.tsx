import { useState } from 'react';
import { Switch, Route, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, useApp, ADMIN_EMAILS } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import LoginModal from './components/LoginModal';
import VipModal from './components/VipModal';
import Home from './pages/Home';
import PlayPage from './pages/PlayPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMovies from './pages/admin/AdminMovies';
import AdminSeries from './pages/admin/AdminSeries';
import AdminEpisodes from './pages/admin/AdminEpisodes';
import AdminLive from './pages/admin/AdminLive';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminWallet from './pages/admin/AdminWallet';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSEO from './pages/admin/AdminSEO';
import AdminCarousel from './pages/admin/AdminCarousel';

const queryClient = new QueryClient();

function AdminLoginScreen() {
  const { loginWithEmailOrPhone, loginWithGoogle } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) { setError('PLEASE ENTER YOUR EMAIL AND PASSWORD'); return; }
    setLoading(true); setError('');
    try {
      await loginWithEmailOrPhone(email.trim(), password);
    } catch (e: any) {
      setError(e.message || 'LOGIN FAILED');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      await loginWithGoogle();
    } catch (e: any) {
      setError(e.message || 'GOOGLE LOGIN FAILED');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: 16 }}>
      <div style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px 36px', width: 380, maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 22, fontWeight: 900, letterSpacing: 1, marginBottom: 10 }}>
            <span style={{ color: '#e50914' }}>FILM ILEB</span><span style={{ color: '#fff' }}> LUO</span>
          </div>
          <div style={{ width: 48, height: 48, background: 'rgba(229,9,20,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e50914" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div style={{ color: '#e50914', fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>ADMIN ACCESS</div>
          <div style={{ color: '#444', fontSize: 10, letterSpacing: 1, marginTop: 6 }}>SIGN IN WITH YOUR ACCOUNT TO CONTINUE</div>
        </div>

        {error && (
          <div style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#e50914', fontSize: 11, letterSpacing: 0.8 }}>
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="EMAIL"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{ width: '100%', padding: '13px 14px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 12, letterSpacing: 1, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
        />

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            type={show ? 'text' : 'password'}
            placeholder="PASSWORD"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={{ width: '100%', padding: '13px 44px 13px 14px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 13, letterSpacing: 2, outline: 'none', boxSizing: 'border-box' }}
          />
          <button onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, display: 'flex' }}>
            {show
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>

        <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#333' : 'linear-gradient(135deg,#e50914,#c0000a)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: 2, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>

        <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', padding: '13px', background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#ccc', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          CONTINUE WITH GOOGLE
        </button>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ color: '#333', fontSize: 10, letterSpacing: 1, textDecoration: 'none' }}>← BACK TO SITE</a>
        </div>
      </div>
    </div>
  );
}

function AdminGate() {
  const { user, authLoading } = useApp();

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ width: 32, height: 32, border: '2px solid rgba(229,9,20,0.3)', borderTop: '2px solid #e50914', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: '#333', fontSize: 11, letterSpacing: 1 }}>LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return <AdminLoginScreen />;
  }

  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'Arial, sans-serif' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01"/></svg>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>ACCESS DENIED</div>
        <div style={{ color: '#555', fontSize: 11, letterSpacing: 0.8 }}>YOU DO NOT HAVE ADMIN PRIVILEGES</div>
        <a href="/" style={{ color: '#e50914', fontSize: 11, letterSpacing: 1, textDecoration: 'none', marginTop: 8 }}>BACK TO SITE</a>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/movies" component={AdminMovies} />
        <Route path="/admin/series" component={AdminSeries} />
        <Route path="/admin/episodes" component={AdminEpisodes} />
        <Route path="/admin/live" component={AdminLive} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/subscriptions" component={AdminSubscriptions} />
        <Route path="/admin/wallet" component={AdminWallet} />
        <Route path="/admin/carousel" component={AdminCarousel} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/seo" component={AdminSEO} />
        <Route>{() => <Redirect to="/admin" />}</Route>
      </Switch>
    </AdminLayout>
  );
}

function MainSite() {
  return (
    <>
      <Sidebar />
      <Header />
      <MobileBottomNav />
      <LoginModal />
      <VipModal />
      <div className="channel_container">
        <div className="channel_container_modulelist">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/search" component={SearchPage} />
            <Route path="/play/:id" component={PlayPage} />
            <Route path="/drama">{() => <CategoryPage categoryId="drama" />}</Route>
            <Route path="/anime">{() => <CategoryPage categoryId="anime" />}</Route>
            <Route path="/movies">{() => <CategoryPage categoryId="movies" />}</Route>
            <Route path="/variety">{() => <CategoryPage categoryId="variety" />}</Route>
            <Route path="/short">{() => <CategoryPage categoryId="short" />}</Route>
            <Route path="/kids">{() => <CategoryPage categoryId="kids" />}</Route>
            <Route path="/vip">{() => <CategoryPage categoryId="vip" />}</Route>
            <Route path="/documentary">{() => <CategoryPage categoryId="documentary" />}</Route>
            <Route path="/sports">{() => <CategoryPage categoryId="sports" />}</Route>
            <Route path="/culture">{() => <CategoryPage categoryId="culture" />}</Route>
            <Route path="/live">{() => <CategoryPage categoryId="live" />}</Route>
            <Route path="/games">{() => <CategoryPage categoryId="games" />}</Route>
            <Route path="/learning">{() => <CategoryPage categoryId="learning" />}</Route>
            <Route path="/knowledge">{() => <CategoryPage categoryId="knowledge" />}</Route>
            <Route path="/new-films">{() => <CategoryPage categoryId="new-films" />}</Route>
            <Route path="/health">{() => <CategoryPage categoryId="health" />}</Route>
            <Route path="/charity">{() => <CategoryPage categoryId="charity" />}</Route>
            <Route path="/accessible">{() => <CategoryPage categoryId="accessible" />}</Route>
            <Route>{() => (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#666', fontSize: 14, fontFamily: 'Arial, sans-serif', gap: 12 }}>
                <span style={{ fontSize: 48, opacity: 0.2 }}>404</span>
                <span>PAGE NOT FOUND</span>
              </div>
            )}</Route>
          </Switch>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Switch>
            <Route path="/admin">
              {() => <AdminGate />}
            </Route>
            <Route path="/admin/:rest*">
              {() => <AdminGate />}
            </Route>
            <Route>
              {() => <MainSite />}
            </Route>
          </Switch>
        </WouterRouter>
      </AppProvider>
    </QueryClientProvider>
  );
}
