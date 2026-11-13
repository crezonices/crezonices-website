import { requireFirebase } from './firebase';
export async function getFirebaseFunctions(){requireFirebase();const { getFunctions }=await import('firebase/functions');return getFunctions(requireFirebase())}
