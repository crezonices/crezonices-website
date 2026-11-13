import { getAuth } from 'firebase/auth'; import { requireFirebase } from './firebase';
export const getFirebaseAuth=()=>getAuth(requireFirebase());
