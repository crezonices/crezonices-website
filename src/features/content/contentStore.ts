import type {
  AdminActivityLog,
  ContactEnquiry,
  EnquiryStatus,
  Founder,
  PageContent,
  Project,
  Review,
  Service,
  SiteSettings,
} from '../../types/models';
import { firebaseConfigurationError } from '../../lib/firebase/firebase';
import { getFirebaseDb } from '../../lib/firebase/firestore';

export const urlIsSafe = (value?: string): boolean => {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !(u.hostname === 'github.com' && u.pathname.includes('/blob/'));
  } catch {
    return false;
  }
};

const ordered = <T extends { displayOrder?: number }>(records: T[]): T[] =>
  records.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

// ============================================================================
// 1. PUBLIC REAL-TIME SUBSCRIBERS
// ============================================================================

export async function subscribePublishedProjects(
  set: (data: Project[]) => void,
  error: (message: string) => void
): Promise<() => void> {
  if (firebaseConfigurationError) return () => {};
  try {
    const fs = await import('firebase/firestore');
    const db = await getFirebaseDb();
    return fs.onSnapshot(
      fs.query(fs.collection(db, 'projects'), fs.where('isPublished', '==', true)),
      (snap) => {
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Project);
        set(ordered(docs));
      },
      () => error('Published projects are temporarily unavailable.')
    );
  } catch {
    return () => {};
  }
}

export async function subscribePublishedTeam(
  set: (data: Founder[]) => void,
  error: (message: string) => void
): Promise<() => void> {
  if (firebaseConfigurationError) return () => {};
  try {
    const fs = await import('firebase/firestore');
    const db = await getFirebaseDb();
    return fs.onSnapshot(
      fs.query(fs.collection(db, 'teamMembers'), fs.where('isPublished', '==', true)),
      (snap) => {
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Founder);
        set(ordered(docs));
      },
      () => error('Team profiles are temporarily unavailable.')
    );
  } catch {
    return () => {};
  }
}

export async function subscribePublishedServices(
  set: (data: Service[]) => void,
  error: (message: string) => void
): Promise<() => void> {
  if (firebaseConfigurationError) return () => {};
  try {
    const fs = await import('firebase/firestore');
    const db = await getFirebaseDb();
    return fs.onSnapshot(
      fs.query(fs.collection(db, 'services'), fs.where('active', '==', true)),
      (snap) => {
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Service);
        set(ordered(docs));
      },
      () => error('Services are temporarily unavailable.')
    );
  } catch {
    return () => {};
  }
}

export async function subscribePublishedReviews(
  set: (data: Review[]) => void,
  error: (message: string) => void
): Promise<() => void> {
  if (firebaseConfigurationError) return () => {};
  try {
    const fs = await import('firebase/firestore');
    const db = await getFirebaseDb();
    return fs.onSnapshot(
      fs.query(fs.collection(db, 'reviews'), fs.where('isPublished', '==', true)),
      (snap) => {
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Review);
        set(ordered(docs));
      },
      () => error('Reviews are temporarily unavailable.')
    );
  } catch {
    return () => {};
  }
}

export async function subscribePageContent(
  pageId: string,
  set: (data: PageContent) => void
): Promise<() => void> {
  if (firebaseConfigurationError) return () => {};
  try {
    const fs = await import('firebase/firestore');
    const db = await getFirebaseDb();
    return fs.onSnapshot(fs.doc(db, 'pageContent', pageId), (docSnap) => {
      if (docSnap.exists()) {
        set({ id: docSnap.id, ...docSnap.data() } as PageContent);
      }
    });
  } catch {
    return () => {};
  }
}

export async function subscribeSiteSettings(
  set: (data: Partial<SiteSettings>) => void
): Promise<() => void> {
  if (firebaseConfigurationError) return () => {};
  try {
    const fs = await import('firebase/firestore');
    const db = await getFirebaseDb();

    const unsubGeneral = fs.onSnapshot(fs.doc(db, 'siteSettings', 'general'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        set({
          companyName: d.siteTitle,
          metaTitle: d.metaTitle || d.siteTitle,
          metaDescription: d.metaDescription,
          footerCopyright: d.footerCopyright,
          maintenanceMode: d.maintenanceMode,
        });
      }
    });

    const unsubContact = fs.onSnapshot(fs.doc(db, 'siteSettings', 'contact'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        set({
          email: d.email,
          phone: d.phone,
          address: d.officeAddress,
          officeHours: d.officeHours,
          responseTime: d.responseGuarantee,
        });
      }
    });

    const unsubSocial = fs.onSnapshot(fs.doc(db, 'siteSettings', 'social'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        set({
          socialLinks: {
            linkedin: d.linkedin || '',
            github: d.github || '',
            twitter: d.twitter || '',
            instagram: d.instagram || '',
            youtube: d.youtube || '',
          },
        });
      }
    });

    return () => {
      unsubGeneral();
      unsubContact();
      unsubSocial();
    };
  } catch {
    return () => {};
  }
}

// ============================================================================
// 2. CONTACT ENQUIRY PUBLIC SUBMISSION
// ============================================================================

export async function submitContactEnquiry(data: {
  name: string;
  email: string;
  serviceNeeded?: string;
  budgetRange?: string;
  message: string;
}): Promise<string> {
  if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
    throw new Error('Name, email, and message are required.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Please enter a valid email address.');
  }

  const fs = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docRef = await fs.addDoc(fs.collection(db, 'enquiries'), {
    ...data,
    status: 'new',
    createdAt: fs.serverTimestamp(),
  });
  return docRef.id;
}

// ============================================================================
// 3. ADMINISTRATOR CRUD & ACTIVITY LOGGING
// ============================================================================

export async function logAdminActivity(
  adminEmail: string,
  adminUid: string,
  action: string,
  collection: string,
  targetTitle?: string,
  details?: string
): Promise<void> {
  try {
    const fs = await import('firebase/firestore');
    const db = await getFirebaseDb();
    await fs.addDoc(fs.collection(db, 'activityLogs'), {
      timestamp: fs.serverTimestamp(),
      adminEmail,
      adminUid,
      action,
      collection,
      targetTitle: targetTitle || 'Unknown',
      details: details || '',
    });
  } catch {
    // Activity logging fails silently if offline
  }
}

export async function listAdminRecords<T>(
  collectionName: string,
  orderByField: string = 'displayOrder'
): Promise<T[]> {
  const fs = await import('firebase/firestore');
  const db = await getFirebaseDb();
  try {
    const snap = await fs.getDocs(
      fs.query(fs.collection(db, collectionName), fs.orderBy(orderByField, 'asc'))
    );
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
  } catch {
    // Fallback without orderBy index requirement
    const snap = await fs.getDocs(fs.collection(db, collectionName));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
  }
}

export async function getAdminRecord<T>(collectionName: string, id: string): Promise<T | null> {
  const fs = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docSnap = await fs.getDoc(fs.doc(db, collectionName, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as T;
}

export async function saveAdminRecord(
  collectionName: string,
  id: string | undefined,
  record: Record<string, unknown>,
  adminUid: string,
  adminEmail: string = '',
  targetTitle: string = ''
): Promise<string> {
  const fs = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const base = {
    ...record,
    updatedAt: fs.serverTimestamp(),
    updatedBy: adminUid,
  };

  let savedId = id;
  if (id) {
    await fs.updateDoc(fs.doc(db, collectionName, id), base);
    await logAdminActivity(
      adminEmail,
      adminUid,
      `update_${collectionName}`,
      collectionName,
      targetTitle || id,
      `Updated document in ${collectionName}`
    );
  } else {
    const docRef = await fs.addDoc(fs.collection(db, collectionName), {
      ...base,
      createdAt: fs.serverTimestamp(),
      createdBy: adminUid,
    });
    savedId = docRef.id;
    await logAdminActivity(
      adminEmail,
      adminUid,
      `create_${collectionName}`,
      collectionName,
      targetTitle || savedId,
      `Created new document in ${collectionName}`
    );
  }
  return savedId || '';
}

export async function deleteAdminRecord(
  collectionName: string,
  id: string,
  adminUid: string = '',
  adminEmail: string = '',
  targetTitle: string = ''
): Promise<void> {
  const fs = await import('firebase/firestore');
  const db = await getFirebaseDb();
  await fs.deleteDoc(fs.doc(db, collectionName, id));
  await logAdminActivity(
    adminEmail,
    adminUid,
    `delete_${collectionName}`,
    collectionName,
    targetTitle || id,
    `Deleted document ${id} from ${collectionName}`
  );
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
  notes: string = '',
  adminUid: string = '',
  adminEmail: string = ''
): Promise<void> {
  const fs = await import('firebase/firestore');
  const db = await getFirebaseDb();
  await fs.updateDoc(fs.doc(db, 'enquiries', id), {
    status,
    notes,
    resolvedAt: status === 'resolved' ? fs.serverTimestamp() : null,
    updatedAt: fs.serverTimestamp(),
  });
  await logAdminActivity(
    adminEmail,
    adminUid,
    'enquiry_status_updated',
    'enquiries',
    id,
    `Marked enquiry as ${status}`
  );
}

export async function listActivityLogs(maxLimit: number = 25): Promise<AdminActivityLog[]> {
  try {
    const fs = await import('firebase/firestore');
    const db = await getFirebaseDb();
    const snap = await fs.getDocs(
      fs.query(fs.collection(db, 'activityLogs'), fs.orderBy('timestamp', 'desc'), fs.limit(maxLimit))
    );
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AdminActivityLog);
  } catch {
    return [];
  }
}

export interface DashboardMetrics {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalTeam: number;
  totalServices: number;
  publishedReviews: number;
  newEnquiries: number;
  pendingEnquiries: number;
  resolvedEnquiries: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const fs = await import('firebase/firestore');
    const db = await getFirebaseDb();

    const [projectsSnap, teamSnap, servicesSnap, reviewsSnap, enquiriesSnap] = await Promise.all([
      fs.getDocs(fs.collection(db, 'projects')),
      fs.getDocs(fs.collection(db, 'teamMembers')),
      fs.getDocs(fs.collection(db, 'services')),
      fs.getDocs(fs.collection(db, 'reviews')),
      fs.getDocs(fs.collection(db, 'enquiries')),
    ]);

    const projects = projectsSnap.docs.map((d) => d.data());
    const publishedProjects = projects.filter((p) => p.isPublished === true || p.published === true).length;

    const reviews = reviewsSnap.docs.map((d) => d.data());
    const publishedReviews = reviews.filter((r) => r.isPublished === true || r.published === true).length;

    const enquiries = enquiriesSnap.docs.map((d) => d.data() as ContactEnquiry);
    const newEnquiries = enquiries.filter((e) => e.status === 'new' || !e.status).length;
    const pendingEnquiries = enquiries.filter((e) => e.status === 'pending' || e.status === 'in-progress').length;
    const resolvedEnquiries = enquiries.filter((e) => e.status === 'resolved').length;

    return {
      totalProjects: projectsSnap.size,
      publishedProjects,
      draftProjects: projectsSnap.size - publishedProjects,
      totalTeam: teamSnap.size,
      totalServices: servicesSnap.size,
      publishedReviews,
      newEnquiries,
      pendingEnquiries,
      resolvedEnquiries,
    };
  } catch {
    return {
      totalProjects: 0,
      publishedProjects: 0,
      draftProjects: 0,
      totalTeam: 0,
      totalServices: 0,
      publishedReviews: 0,
      newEnquiries: 0,
      pendingEnquiries: 0,
      resolvedEnquiries: 0,
    };
  }
}
