import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, updateProfile, User as FBUser,
} from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider } from '../lib/firebase';
import { getUser, setUser, getUserByPhone, UserDoc, getSiteSettings, getSeoSettings, SiteSettingsDoc } from '../lib/db';

export const ADMIN_EMAILS = ['mainplatform.nexus@gmail.com', 'panzersonic@gmail.com'];

export type AppUser = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  isVip: boolean;
  isAdmin: boolean;
  photoURL?: string;
  vipExpiry?: string;
};

const DEFAULT_SITE: SiteSettingsDoc = {
  name: 'LUO STREAM', tagline: 'LUO TRANSLATED MOVIES — DOWNLOAD AND STREAM', logo: '',
  primaryColor: '#e50914', footerText: '© 2025 LUO STREAM. ALL RIGHTS RESERVED.',
  maintenance: false,
  notifications: { emailNewUser: true, emailNewSub: true, emailWithdrawal: true, smsAlerts: false },
};

type AppContextType = {
  user: AppUser | null;
  isLoggedIn: boolean;
  authLoading: boolean;
  loginModalOpen: boolean;
  loginTab: 'login' | 'register';
  vipModalOpen: boolean;
  siteSettings: SiteSettingsDoc;
  setSiteSettings: (s: SiteSettingsDoc) => void;
  openLogin: (tab?: 'login' | 'register') => void;
  closeLogin: () => void;
  openVip: () => void;
  closeVip: () => void;
  refreshUser: () => Promise<void>;
  loginWithEmailOrPhone: (identifier: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, phone: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AppContext = createContext<AppContextType>({} as AppContextType);

function fbUserToApp(fb: FBUser, doc?: UserDoc | null): AppUser {
  const email = doc?.email || fb.email || '';
  return {
    uid: fb.uid,
    name: doc?.name || fb.displayName || 'USER',
    email,
    phone: doc?.phone || '',
    isVip: doc?.isVip || false,
    isAdmin: ADMIN_EMAILS.includes(email.toLowerCase()),
    photoURL: fb.photoURL || '',
    vipExpiry: doc?.vipExpiry ? (doc.vipExpiry as any).toDate?.().toISOString() : undefined,
  };
}

function applySiteToDocument(site: SiteSettingsDoc) {
  document.title = site.name || 'LUO STREAM';
  const root = document.documentElement;
  root.style.setProperty('--primary-color', site.primaryColor || '#e50914');
  if (site.logo) {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = site.logo;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setAppUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login');
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [siteSettings, setSiteSettingsState] = useState<SiteSettingsDoc>(DEFAULT_SITE);

  useEffect(() => {
    Promise.all([getSiteSettings(), getSeoSettings()]).then(([s, seo]) => {
      setSiteSettingsState(s);
      applySiteToDocument(s);
      if (seo.title) document.title = seo.title;
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async fb => {
      if (fb) {
        const doc = await getUser(fb.uid);
        setAppUser(fbUserToApp(fb, doc));
      } else {
        setAppUser(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const refreshUser = async () => {
    const fb = auth.currentUser;
    if (!fb) return;
    const doc = await getUser(fb.uid);
    setAppUser(fbUserToApp(fb, doc));
  };

  const setSiteSettings = (s: SiteSettingsDoc) => {
    setSiteSettingsState(s);
    applySiteToDocument(s);
  };

  const loginWithEmailOrPhone = async (identifier: string, password: string) => {
    let email = identifier.trim();
    if (!email.includes('@')) {
      const userDoc = await getUserByPhone(email);
      if (!userDoc) throw new Error('NO ACCOUNT FOUND WITH THIS PHONE NUMBER');
      email = userDoc.email;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerUser = async (name: string, email: string, phone: string, password: string) => {
    const existing = await getUserByPhone(phone);
    if (existing) throw new Error('PHONE NUMBER ALREADY REGISTERED');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setUser(cred.user.uid, {
      uid: cred.user.uid,
      name,
      email,
      phone,
      isAdmin: false,
      isVip: false,
      vipExpiry: null,
      status: 'active',
      createdAt: serverTimestamp() as any,
    });
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const fb = cred.user;
    const existing = await getUser(fb.uid);
    if (!existing) {
      await setUser(fb.uid, {
        uid: fb.uid,
        name: fb.displayName || 'GOOGLE USER',
        email: fb.email || '',
        phone: '',
        isAdmin: false,
        isVip: false,
        vipExpiry: null,
        status: 'active',
        createdAt: serverTimestamp() as any,
        photoURL: fb.photoURL || '',
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (siteSettings.maintenance && !user?.isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px 32px' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 20 }}>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <div style={{ color: '#f5a623', fontSize: 13, fontWeight: 900, letterSpacing: 2, marginBottom: 10 }}>MAINTENANCE MODE</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: 8 }}>{siteSettings.name}</div>
          <div style={{ color: '#555', fontSize: 12, letterSpacing: 1, marginBottom: 24 }}>We're making improvements. We'll be back shortly.</div>
          <div style={{ color: '#333', fontSize: 10, letterSpacing: 0.8 }}>{siteSettings.tagline}</div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      user,
      isLoggedIn: !!user,
      authLoading,
      loginModalOpen,
      loginTab,
      vipModalOpen,
      siteSettings,
      setSiteSettings,
      openLogin: (tab = 'login') => { setLoginTab(tab); setLoginModalOpen(true); },
      closeLogin: () => setLoginModalOpen(false),
      openVip: () => setVipModalOpen(true),
      closeVip: () => setVipModalOpen(false),
      refreshUser,
      loginWithEmailOrPhone,
      registerUser,
      loginWithGoogle,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
