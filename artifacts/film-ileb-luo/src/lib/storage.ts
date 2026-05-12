import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      'state_changed',
      snap => { if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)); },
      reject,
      async () => { resolve(await getDownloadURL(task.snapshot.ref)); }
    );
  });
}

export async function deleteFile(url: string) {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch {
    // ignore if already deleted
  }
}

export function getStoragePath(type: 'thumbnail' | 'video' | 'logo', filename: string) {
  return `${type}s/${Date.now()}_${filename}`;
}
