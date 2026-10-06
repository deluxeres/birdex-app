import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Interactive } from './motion/Interactive';
import { Telegram } from './Icon';
export function AppLink({ compact = false, onMissing }: { compact?: boolean; onMissing: () => void }) {
 const url=import.meta.env.VITE_MINI_APP_URL;
 const content=<>{!compact&&<Telegram/>}<span>{compact?'Open App':'Open Mini App'}</span><ArrowUpRight size={17}/></>;
 return <Interactive className="magnetic">{url ? <a className="button primary" href={url} target="_blank" rel="noopener noreferrer" data-cursor="open">{content}</a> : <button className="button primary" onClick={onMissing} data-cursor="open">{content}</button>}</Interactive>;
}
export function SocialLink({ kind, children, onMissing, className = '' }: {kind:'TELEGRAM'|'X'; children:ReactNode;onMissing:()=>void;className?:string}) {const url=kind==='TELEGRAM'?import.meta.env.VITE_TELEGRAM_URL:import.meta.env.VITE_X_URL;return url?<a className={className} href={url} target="_blank" rel="noopener noreferrer">{children}</a>:<button className={className} onClick={onMissing}>{children}</button>;}

