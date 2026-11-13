import { founders, projects, reviews, services } from './content'; import type { Founder, Project, Review, Service } from '../types/models';
export interface PublicContentRepository { projects():Promise<Project[]>; projectBySlug(slug:string):Promise<Project|undefined>; founders():Promise<Founder[]>; services():Promise<Service[]>; publishedReviews():Promise<Review[]> }
// Swap this adapter for a Firestore-backed implementation in Prompt 3; UI consumers remain unchanged.
export const localContentRepository:PublicContentRepository={projects:async()=>projects,projectBySlug:async slug=>projects.find(p=>p.slug===slug),founders:async()=>founders,services:async()=>services,publishedReviews:async()=>reviews.filter(r=>r.published)};
