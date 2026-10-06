import { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { AppLink, SocialLink } from './AppLink';
import { Telegram } from './Icon';
import { NavigationIndicator } from './motion/NavigationIndicator';
import { BirdexLogo } from './BirdexLogo';
export function Header({ theme, toggle, onMissing }: {theme:string;toggle:()=>void;onMissing:()=>void}) {
 const nav=useRef<HTMLElement>(null);
 const [menu,setMenu]=useState(false),[scrolled,setScrolled]=useState(false);
 useEffect(()=>{const scroll=()=>setScrolled(window.scrollY>16);scroll();window.addEventListener('scroll',scroll,{passive:true});return()=>window.removeEventListener('scroll',scroll);},[]);
 return <header className={scrolled?'header scrolled':'header'}><div className="header-inner"><BirdexLogo onNavigate={()=>setMenu(false)}/><nav ref={nav} className={menu?'navigation open':'navigation'} aria-label="Main navigation">{[['/','Home'],['/season','Season'],['/rewards','Rewards'],['/docs','Docs']].map(([path,label])=><NavLink end to={path} key={path} onClick={()=>setMenu(false)}>{label}</NavLink>)}<NavigationIndicator nav={nav} menu={menu}/></nav><div className="header-actions"><SocialLink kind="TELEGRAM" onMissing={onMissing} className="icon-button social"><span className="sr-only">Telegram community</span><Telegram size={19}/></SocialLink><SocialLink kind="X" onMissing={onMissing} className="icon-button social"><span className="sr-only">BIRDEX on X</span><span className="x-icon">𝕏</span></SocialLink><span className="action-divider"/><button className="icon-button theme-switch" onClick={toggle} aria-label={`Switch to ${theme==='light'?'dark':'light'} theme`}>{theme==='light'?<Moon size={18}/>:<Sun size={18}/>}</button><AppLink compact onMissing={onMissing}/><button className="icon-button mobile-menu" aria-label="Toggle navigation" aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X size={22}/>:<Menu size={22}/>}</button></div></div></header>;
}

