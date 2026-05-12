import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyCKc0OEeWKIuvgQrWvzPJ3O0zsy4UTHU6I',
  authDomain: 'film-ileb-luo.firebaseapp.com',
  databaseURL: 'https://film-ileb-luo-default-rtdb.firebaseio.com',
  projectId: 'film-ileb-luo',
  storageBucket: 'film-ileb-luo.firebasestorage.app',
  messagingSenderId: '91896188312',
  appId: '1:91896188312:web:66bcb525f1ea426d806fed',
  measurementId: 'G-MP967TTX55',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

isSupported().then(ok => { if (ok) getAnalytics(app); });
