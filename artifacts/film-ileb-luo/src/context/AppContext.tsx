import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, updateProfile, User as FBUser,
} from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider } from '../lib/firebase';
import { getUser, setUser, getUserByPhone, UserDoc } from '../lib/db';

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

type AppContextType = {
  user: AppUser | null;
  isLoggedIn: boolean;
  authLoading: boolean;
  loginModalOpen: boolean;
  loginTab: 'login' | 'register';
  vipModalOpen: boolean;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setAppUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login');
  const [vipModalOpen, setVipModalOpen] = useState(false);

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

  return (
    <AppContext.Provider value={{
      user,
      isLoggedIn: !!user,
      authLoading,
      loginModalOpen,
      loginTab,
      vipModalOpen,
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
