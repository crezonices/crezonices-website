import { requireFirebase } from './firebase';
export async function getFirebaseStorage(){requireFirebase();const { getStorage }=await import('firebase/storage');return getStorage(requireFirebase())}
