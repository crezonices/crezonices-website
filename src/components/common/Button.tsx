import { ArrowUpRight } from 'lucide-react'; import type { AnchorHTMLAttributes } from 'react';
export function Button({children,variant='primary',...props}:{children:React.ReactNode;variant?:'primary'|'ghost'}&AnchorHTMLAttributes<HTMLAnchorElement>){return <a className={`button ${variant}`} {...props}>{children}<ArrowUpRight size={16}/></a>}
