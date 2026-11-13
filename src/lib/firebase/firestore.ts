import { requireFirebase } from './firebase';
/** Deferred Firestore accessor; importing this module never initializes Firebase prematurely. */
export async function getFirebaseDb(){requireFirebase();const { getFirestore }=await import('firebase/firestore');return getFirestore(requireFirebase())}
