import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
const required=['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_STORAGE_BUCKET','VITE_FIREBASE_MESSAGING_SENDER_ID','VITE_FIREBASE_APP_ID'] as const;
const missing=required.filter(key=>!import.meta.env[key]);
export const firebaseConfigurationError=missing.length?`Firebase is not configured. Set ${missing.join(', ')} in .env.local.`:undefined;
const config={apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,messagingSenderId:import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID,measurementId:import.meta.env.VITE_FIREBASE_MEASUREMENT_ID};
export const firebaseApp:FirebaseApp|undefined=!firebaseConfigurationError?(getApps().length?getApp():initializeApp(config)):undefined;
export function requireFirebase(){if(!firebaseApp)throw new Error(firebaseConfigurationError);return firebaseApp}
