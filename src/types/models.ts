export type ProjectCategory = 'IoT' | 'Cybersecurity' | 'AI/ML' | 'Web Development' | 'Other';
export type ProjectStatus = 'Concept' | 'In development' | 'Completed' | 'In Progress' | 'Upcoming' | 'Published';

export interface Project {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription: string;
  fullDescription?: string;
  category: ProjectCategory;
  imageUrl?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  thumbnail?: string;
  gallery?: string[];
  technologies: string[];
  problemStatement?: string;
  solution?: string;
  features?: string[];
  status: ProjectStatus;
  projectUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  isPublished?: boolean;
  published?: boolean;
  displayOrder: number;
  customButtonText?: string;
  completionDate?: string;
  placeholder?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export type TeamRole = 'Founder' | 'Co-founder' | 'Director' | 'Team Member';

export interface Founder {
  id: string;
  name?: string;
  role?: TeamRole;
  designation: string;
  image?: string;
  imageUrl?: string;
  shortBio: string;
  biography?: string;
  expertise: string[];
  skills: string[];
  socialLinks: Record<string, string | undefined>;
  displayOrder: number;
  isPublished?: boolean;
  featured?: boolean;
  placeholder?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  features: string[];
  image?: string;
  imageUrl?: string;
  icon?: string;
  displayOrder: number;
  active: boolean;
  isPublished?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Review {
  id: string;
  reviewerName: string;
  designation?: string;
  reviewerDesignation?: string;
  organization?: string;
  company?: string;
  reviewText: string;
  image?: string;
  imageUrl?: string;
  rating: number;
  published: boolean;
  isPublished?: boolean;
  displayOrder: number;
  createdAt?: any;
  updatedAt?: any;
}

export type EnquiryStatus = 'new' | 'pending' | 'in-progress' | 'resolved';

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  serviceNeeded?: string;
  budgetRange?: string;
  message: string;
  status: EnquiryStatus;
  notes?: string;
  createdAt?: any;
  resolvedAt?: any;
}

export interface PageContent {
  id: string; // 'homepage' | 'about' | 'services' | 'founders' | 'projects' | 'contact'
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryLink?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryLink?: string;
  heroImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt?: any;
}

export interface SiteSettings {
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  officeHours?: string;
  responseTime?: string;
  logoUrl?: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
  footerCopyright?: string;
  maintenanceMode?: boolean;
  updatedAt?: any;
}

export interface AdminActivityLog {
  id: string;
  timestamp: any;
  adminEmail: string;
  adminUid: string;
  action: string;
  collection: string;
  targetTitle?: string;
  details?: string;
}

export interface CompanySettings {
  companyName: string;
  email: string;
  phone?: string;
  logo: string;
  socialLinks: Record<string, string | undefined>;
  description: string;
}
