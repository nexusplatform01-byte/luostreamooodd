import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Typed helpers ──────────────────────────────────────────────────────────

export type UserDoc = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  isVip: boolean;
  vipExpiry: Timestamp | null;
  status: 'active' | 'suspended';
  createdAt: Timestamp;
  photoURL?: string;
};

export type ContentDoc = {
  id?: string;
  type: 'movie' | 'series' | 'live';
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  year: string;
  duration: string;
  rating: string;
  tags: string;
  badge: string;
  isFeatured: boolean;
  status: string;
  totalEpisodes: string;
  language: string;
  isActive: boolean;
  views: number;
  homeSection: string;
  createdAt: Timestamp;
};

export type EpisodeDoc = {
  id?: string;
  seriesId: string;
  title: string;
  episodeNumber: number;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  isFree: boolean;
  createdAt: Timestamp;
};

export type PlanDoc = {
  id?: string;
  name: string;
  price: number;
  duration: number;
  durationUnit: 'day' | 'week' | 'month' | 'year';
  features: string;
  isActive: boolean;
  color: string;
};

export type SubscriptionDoc = {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: string;
  amount: number;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'expired' | 'cancelled';
};

export type TransactionDoc = {
  id?: string;
  type: 'subscription' | 'withdrawal' | 'refund';
  desc: string;
  amount: number;
  date: Timestamp;
  status: 'completed' | 'pending';
};

export type SiteSettingsDoc = {
  name: string;
  tagline: string;
  logo: string;
  primaryColor: string;
  footerText: string;
  maintenance: boolean;
  notifications: { emailNewUser: boolean; emailNewSub: boolean; emailWithdrawal: boolean; smsAlerts: boolean };
};

export type SeoDoc = {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
  robots: string;
  twitterCard: string;
  gaId: string;
  gtmId: string;
  pixelId: string;
  sitemapFrequency: string;
  sitemapPriority: string;
};

export type AdminAuthDoc = {
  email: string;
};

export type CarouselDoc = {
  id?: string;
  image: string;
  title: string;
  description: string;
  contentId: string;
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
};

export type WatchHistoryDoc = {
  contentId: string;
  title: string;
  thumbnail: string;
  watchedAt: number;
};

// ── User operations ─────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function setUser(uid: string, data: Partial<UserDoc>) {
  await setDoc(doc(db, 'users', uid), { ...data, uid }, { merge: true });
}

export async function getUserByPhone(phone: string): Promise<UserDoc | null> {
  const q = query(collection(db, 'users'), where('phone', '==', phone), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as UserDoc;
}

export async function getAllUsers(): Promise<UserDoc[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => d.data() as UserDoc);
}

export async function hasAnyAdmin(): Promise<boolean> {
  const q = query(collection(db, 'users'), where('isAdmin', '==', true), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

export function subscribeUsers(cb: (users: UserDoc[]) => void) {
  return onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), snap => {
    cb(snap.docs.map(d => d.data() as UserDoc));
  });
}

// ── Admin auth settings ──────────────────────────────────────────────────────

export async function getAdminAuth(): Promise<AdminAuthDoc | null> {
  const snap = await getDoc(doc(db, 'settings', 'adminAuth'));
  return snap.exists() ? (snap.data() as AdminAuthDoc) : null;
}

export async function setAdminAuth(data: AdminAuthDoc) {
  await setDoc(doc(db, 'settings', 'adminAuth'), data);
}

// ── Content operations ──────────────────────────────────────────────────────

export async function getContent(type?: ContentDoc['type']): Promise<ContentDoc[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (type) constraints.unshift(where('type', '==', type));
  const snap = await getDocs(query(collection(db, 'content'), ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentDoc));
}

export async function getAllContent(): Promise<ContentDoc[]> {
  const snap = await getDocs(query(collection(db, 'content'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentDoc));
}

export async function getContentBySection(section: string): Promise<ContentDoc[]> {
  try {
    const snap = await getDocs(query(
      collection(db, 'content'),
      where('homeSection', '==', section),
      orderBy('createdAt', 'desc')
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentDoc));
  } catch {
    return [];
  }
}

export async function addContent(data: Omit<ContentDoc, 'id' | 'createdAt' | 'views'>): Promise<string> {
  const ref = await addDoc(collection(db, 'content'), { ...data, views: 0, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateContent(id: string, data: Partial<ContentDoc>) {
  await updateDoc(doc(db, 'content', id), data);
}

export async function deleteContent(id: string) {
  await deleteDoc(doc(db, 'content', id));
}

export function subscribeContent(type: ContentDoc['type'], cb: (data: ContentDoc[]) => void) {
  const q = query(collection(db, 'content'), where('type', '==', type));
  return onSnapshot(q, snap => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentDoc));
    data.sort((a, b) => ((b.createdAt as any)?.seconds || 0) - ((a.createdAt as any)?.seconds || 0));
    cb(data);
  });
}

// ── Episode operations ──────────────────────────────────────────────────────

export async function getEpisodes(seriesId?: string): Promise<EpisodeDoc[]> {
  const constraints: QueryConstraint[] = [orderBy('episodeNumber', 'asc')];
  if (seriesId) constraints.unshift(where('seriesId', '==', seriesId));
  const snap = await getDocs(query(collection(db, 'episodes'), ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as EpisodeDoc));
}

export async function addEpisode(data: Omit<EpisodeDoc, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'episodes'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateEpisode(id: string, data: Partial<EpisodeDoc>) {
  await updateDoc(doc(db, 'episodes', id), data);
}

export async function deleteEpisode(id: string) {
  await deleteDoc(doc(db, 'episodes', id));
}

// ── Subscription plan operations ────────────────────────────────────────────

const DEFAULT_PLANS: Omit<PlanDoc, 'id'>[] = [
  { name: 'WEEKLY', price: 4000, duration: 1, durationUnit: 'week', features: 'HD STREAMING, NO ADS, 1 DEVICE', isActive: true, color: '#22c55e' },
  { name: 'MONTHLY', price: 12000, duration: 1, durationUnit: 'month', features: 'HD STREAMING, NO ADS, EXCLUSIVE CONTENT, 1 DEVICE', isActive: true, color: '#4a9eff' },
  { name: 'QUARTERLY', price: 30000, duration: 3, durationUnit: 'month', features: '4K ULTRA HD, NO ADS, EXCLUSIVE + PREMIERE, 2 DEVICES, DOWNLOAD OFFLINE', isActive: true, color: '#e50914' },
  { name: 'YEARLY', price: 90000, duration: 1, durationUnit: 'year', features: '4K ULTRA HD, NO ADS, ALL CONTENT, 4 DEVICES, DOWNLOAD OFFLINE, EARLY ACCESS', isActive: true, color: '#f5a623' },
];

export async function getPlans(): Promise<PlanDoc[]> {
  const snap = await getDocs(collection(db, 'plans'));
  if (snap.empty) {
    for (const p of DEFAULT_PLANS) {
      await addDoc(collection(db, 'plans'), p);
    }
    const snap2 = await getDocs(collection(db, 'plans'));
    return snap2.docs.map(d => ({ id: d.id, ...d.data() } as PlanDoc));
  }
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PlanDoc));
}

export async function addPlan(data: Omit<PlanDoc, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'plans'), data);
  return ref.id;
}

export async function updatePlan(id: string, data: Partial<PlanDoc>) {
  await updateDoc(doc(db, 'plans', id), data);
}

export async function deletePlan(id: string) {
  await deleteDoc(doc(db, 'plans', id));
}

// ── Subscription records ────────────────────────────────────────────────────

export async function getSubscriptions(): Promise<SubscriptionDoc[]> {
  const snap = await getDocs(query(collection(db, 'subscriptions'), orderBy('startDate', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionDoc));
}

export async function addSubscription(data: Omit<SubscriptionDoc, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'subscriptions'), data);
  return ref.id;
}

// ── Transaction operations ──────────────────────────────────────────────────

export async function getTransactions(): Promise<TransactionDoc[]> {
  const snap = await getDocs(query(collection(db, 'transactions'), orderBy('date', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TransactionDoc));
}

export async function addTransaction(data: Omit<TransactionDoc, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'transactions'), data);
  return ref.id;
}

// ── Carousel operations ──────────────────────────────────────────────────────

export async function getCarousel(): Promise<CarouselDoc[]> {
  try {
    const snap = await getDocs(query(collection(db, 'carousel'), where('isActive', '==', true), orderBy('order', 'asc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CarouselDoc));
  } catch {
    return [];
  }
}

export async function getAllCarousel(): Promise<CarouselDoc[]> {
  try {
    const snap = await getDocs(query(collection(db, 'carousel'), orderBy('order', 'asc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CarouselDoc));
  } catch {
    return [];
  }
}

export async function addCarousel(data: Omit<CarouselDoc, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'carousel'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateCarousel(id: string, data: Partial<CarouselDoc>) {
  await updateDoc(doc(db, 'carousel', id), data);
}

export async function deleteCarousel(id: string) {
  await deleteDoc(doc(db, 'carousel', id));
}

// ── Site settings ───────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: SiteSettingsDoc = {
  name: 'FILM ILEB LUO', tagline: 'STREAM EVERYTHING', logo: '',
  primaryColor: '#e50914', footerText: '© 2025 FILM ILEB LUO. ALL RIGHTS RESERVED.',
  maintenance: false,
  notifications: { emailNewUser: true, emailNewSub: true, emailWithdrawal: true, smsAlerts: false },
};

export async function getSiteSettings(): Promise<SiteSettingsDoc> {
  const snap = await getDoc(doc(db, 'settings', 'site'));
  return snap.exists() ? (snap.data() as SiteSettingsDoc) : DEFAULT_SETTINGS;
}

export async function saveSiteSettings(data: SiteSettingsDoc) {
  await setDoc(doc(db, 'settings', 'site'), data);
}

// ── SEO settings ────────────────────────────────────────────────────────────

const DEFAULT_SEO: SeoDoc = {
  title: 'FILM ILEB LUO — STREAM EVERYTHING', description: 'Watch thousands of movies, TV dramas, anime, and more.',
  keywords: 'streaming, movies, TV drama, anime, VIP, 4K, film, series',
  ogTitle: 'FILM ILEB LUO', ogDescription: 'Premium video streaming platform.',
  ogImage: '', canonical: 'https://film-ileb-luo.replit.app', robots: 'index, follow',
  twitterCard: 'summary_large_image', gaId: '', gtmId: '', pixelId: '',
  sitemapFrequency: 'weekly', sitemapPriority: '0.8',
};

export async function getSeoSettings(): Promise<SeoDoc> {
  const snap = await getDoc(doc(db, 'settings', 'seo'));
  return snap.exists() ? (snap.data() as SeoDoc) : DEFAULT_SEO;
}

export async function saveSeoSettings(data: SeoDoc) {
  await setDoc(doc(db, 'settings', 'seo'), data);
}

// ── Watch history (localStorage) ─────────────────────────────────────────────

const HISTORY_KEY = 'film_ileb_luo_history';

export function addToHistory(item: WatchHistoryDoc) {
  try {
    const existing = getHistory();
    const filtered = existing.filter(h => h.contentId !== item.contentId);
    const updated = [{ ...item, watchedAt: Date.now() }, ...filtered].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export function getHistory(): WatchHistoryDoc[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function clearHistory() {
  try { localStorage.removeItem(HISTORY_KEY); } catch {}
}
