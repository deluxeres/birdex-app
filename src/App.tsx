import { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useData } from './hooks/useData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PointerEffects } from './components/motion/PointerEffects';

import { Home } from './pages/Home';
import { Season } from './pages/Season';
import { Rewards } from './pages/Rewards';
import { Docs } from './pages/Docs';
export default function App(){const {theme,toggle}=useTheme();const data=useData();const location=useLocation();const reduced=useReducedMotion();const [notice,setNotice]=useState(false);const dialog=useRef<HTMLDialogElement>(null);const onMissing=()=>setNotice(true);
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});const page=location.pathname.slice(1);document.title=`BIRDEX — ${page ? page.charAt(0).toUpperCase()+page.slice(1) : 'Just a chicken thing.'}`;},[location.pathname]);
 useEffect(()=>{if(notice)dialog.current?.showModal();else dialog.current?.close();},[notice]);
 return <><a href="#main" className="skip-link">Skip to content</a><PointerEffects/><Header theme={theme} toggle={toggle} onMissing={onMissing}/><motion.main id="main" tabIndex={-1} className="container" key={location.pathname} initial={reduced?false:{opacity:0,y:7}} animate={{opacity:1,y:0}} transition={{duration:.2}}><Routes><Route path="/" element={<Home data={data} onMissing={onMissing}/>}/><Route path="/season" element={<Season data={data} onMissing={onMissing}/>}/><Route path="/rewards" element={<Rewards data={data}/>}/><Route path="/docs" element={<Docs/>}/><Route path="*" element={<div className="page-heading"><div className="eyebrow">LOST CHICKEN</div><h1>This field is empty.</h1><Link className="button primary" to="/">Back to the farm ↗</Link></div>}/></Routes></motion.main><div className="container"><Footer onMissing={onMissing}/></div><dialog ref={dialog} onCancel={()=>setNotice(false)} onClose={()=>setNotice(false)} className="link-dialog" aria-labelledby="link-dialog-title"><button className="icon-button dialog-close" onClick={()=>setNotice(false)} aria-label="Close"><X/></button><span className="dialog-egg">🥚</span><h2 id="link-dialog-title">The flock is getting ready.</h2><p>The official destination hasn’t been connected to this website yet. Check back for the verified BIRDEX links.</p><button className="button primary" onClick={()=>setNotice(false)}>Got it</button></dialog></>;}



