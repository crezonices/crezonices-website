export type ProjectCategory='IoT'|'Cybersecurity'|'AI/ML'|'Web Development'|'Other';
export type ProjectStatus='Concept'|'In development'|'Completed'|'In Progress'|'Upcoming'|'Published';
export interface Project{id:string;slug:string;title:string;description?:string;shortDescription:string;fullDescription?:string;category:ProjectCategory;imageUrl?:string;logoUrl?:string;thumbnail?:string;gallery?:string[];technologies:string[];problemStatement?:string;solution?:string;features?:string[];status:ProjectStatus;projectUrl?:string;liveUrl?:string;githubUrl?:string;featured:boolean;isPublished?:boolean;displayOrder:number;customButtonText?:string;completionDate?:string;placeholder?:boolean}
export type TeamRole='Founder'|'Co-founder'|'Director'|'Team Member';
export interface Founder{id:string;name?:string;role?:TeamRole;designation:string;image?:string;imageUrl?:string;shortBio:string;biography?:string;expertise:string[];skills:string[];socialLinks:Record<string,string|undefined>;displayOrder:number;isPublished?:boolean;featured?:boolean;placeholder?:boolean}
export interface Service{id:string;slug:string;title:string;description:string;features:string[];image?:string;displayOrder:number;active:boolean}
export interface Review{id:string;reviewerName:string;designation?:string;organization?:string;reviewText:string;image?:string;rating:number;published:boolean;displayOrder:number}
export interface CompanySettings{companyName:string;email:string;phone?:string;logo:string;socialLinks:Record<string,string|undefined>;description:string}
