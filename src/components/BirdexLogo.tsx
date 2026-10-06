import { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './BirdexLogo.css';

// Each path isolates an actual part of the supplied PNG in the same coordinate system.
// The original artwork stays intact; transforms belong to separate layer containers.
const combPath = 'M448 376 C384 340 416 243 480 199 C526 157 572 164 615 191 C646 107 724 18 809 14 C899 7 970 53 948 154 C943 179 932 209 922 233 C986 207 1037 246 1053 304 C1075 376 1022 416 947 424 C978 436 1029 474 1023 500 L969 481 L920 424 C895 453 866 487 824 483 C787 480 791 413 755 385 L722 356 L721 384 L659 332 C591 317 547 319 488 341 L525 350 L448 376 Z';
const glassesPath = 'M209 684 C208 633 266 552 360 514 L397 493 C547 490 685 518 792 571 C829 572 861 579 886 594 C1001 582 1109 619 1216 665 L1208 704 L1198 731 C1162 747 1167 793 1144 838 C1113 902 991 898 923 866 C867 839 864 779 861 720 C860 683 841 650 824 649 C805 639 786 655 770 685 C732 756 667 802 582 799 C506 796 440 778 418 727 C400 689 406 622 397 595 C392 585 376 575 368 579 C315 602 248 638 222 680 Z';
const beakPath = 'M778 678 C834 672 852 718 866 764 L886 840 C908 858 938 876 938 900 L907 952 C848 986 793 950 732 918 L591 850 C569 839 571 813 591 800 C643 782 720 770 778 678 Z';

function MascotLayer({part, id}:{part:'head'|'comb'|'glasses'|'beak';id:string}) {
  const path = part === 'comb' ? combPath : part === 'glasses' ? glassesPath : beakPath;
  return <svg viewBox="0 0 1339 1175" aria-hidden="true" focusable="false">
    <defs>
      <clipPath id={`${id}-${part}-clip`}><path d={path}/></clipPath>
      {part === 'head' && <>
        <mask id={`${id}-head-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="1339" height="1175">
          <rect width="1339" height="1175" fill="white"/><path d={combPath} fill="black"/><path d={glassesPath} fill="black"/><path d={beakPath} fill="black"/>
        </mask>
        <linearGradient id={`${id}-feathers`} x1="0" y1="0" x2="0.4" y2="1"><stop stopColor="#fffdf7"/><stop offset="1" stopColor="#ebd0b2"/></linearGradient>
      </>}
    </defs>
    {part === 'head' && <>
      {/* Feather backing covers areas revealed by the tiny glasses/comb movements. */}
      <path d="M373 508 C506 436 706 490 814 577 C948 540 1097 621 1138 710 L1140 839 C1068 904 929 859 860 748 C806 697 759 720 717 762 C565 838 411 772 399 670 Z" fill={`url(#${id}-feathers)`}/>
      <path d="M743 389 Q792 363 823 416 L855 479 L790 491 Z" fill="#fff8eb"/>
    </>}
    <image href="/assets/logo-mascot.png" width="1339" height="1175" {...(part === 'head' ? {mask:`url(#${id}-head-mask)`} : {clipPath:`url(#${id}-${part}-clip)`})}/>
  </svg>;
}

export function BirdexLogo({onNavigate}:{onNavigate?:()=>void}) {
  const id = useId().replace(/:/g,'');
  const root = useRef<HTMLAnchorElement>(null);
  const idle = useRef<HTMLSpanElement>(null), track = useRef<HTMLSpanElement>(null), reaction = useRef<HTMLSpanElement>(null);
  const comb = useRef<HTMLSpanElement>(null), combDrift = useRef<HTMLSpanElement>(null), glassesTrack = useRef<HTMLSpanElement>(null), glassesReaction = useRef<HTMLSpanElement>(null), egg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const logo = root.current!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    let cleanup = () => {};
    const configure = () => {
      cleanup();
      if (reduced.matches) { cleanup = () => {}; return; }
      let hovered = false, clicking = false, clicks:number[] = [];
      let timer:gsap.core.Tween | undefined, gesture:gsap.core.Timeline | undefined, clickAnimation:gsap.core.Timeline | undefined, eggAnimation:gsap.core.Timeline | undefined;
      const context = gsap.context(() => {
        gsap.set([idle.current, track.current, reaction.current], {transformOrigin:'50% 65%'});
        gsap.set([comb.current,combDrift.current], {transformOrigin:'58% 35%'});
        gsap.set(egg.current, {autoAlpha:0, scale:0, transformOrigin:'50% 50%'});
      }, logo);
      const makeQuick = (target:Element, property:string) => gsap.quickTo(target, property, {duration:.35, ease:'power3.out'});
      let xTo:ReturnType<typeof gsap.quickTo>, yTo:ReturnType<typeof gsap.quickTo>, rotationTo:ReturnType<typeof gsap.quickTo>, gxTo:ReturnType<typeof gsap.quickTo>, gyTo:ReturnType<typeof gsap.quickTo>;
      let drift:gsap.core.Tween, breathe:gsap.core.Tween, combIdle:gsap.core.Tween;
      context.add(() => {
        xTo=makeQuick(track.current!, 'x'); yTo=makeQuick(track.current!, 'y'); rotationTo=makeQuick(track.current!, 'rotation');
        gxTo=makeQuick(glassesTrack.current!, 'x'); gyTo=makeQuick(glassesTrack.current!, 'y');
        drift=gsap.fromTo(idle.current, {rotation:-.5}, {rotation:.5, duration:4.3, repeat:-1, yoyo:true, ease:'sine.inOut'});
        breathe=gsap.to(idle.current, {y:-1, duration:3.7, repeat:-1, yoyo:true, ease:'sine.inOut'});
        combIdle=gsap.fromTo(combDrift.current, {rotation:-.6}, {rotation:.6, duration:4.9, repeat:-1, yoyo:true, ease:'sine.inOut'});
      });
      const schedule = () => {
        timer?.kill();
        if (document.hidden || hovered || clicking) return;
        context.add(() => { timer=gsap.delayedCall(gsap.utils.random(5,12), randomGesture); });
      };
      const randomGesture = () => {
        context.add(() => {
          gesture?.kill();
          gesture=gsap.timeline({onComplete:schedule});
          const choice=gsap.utils.random(0,3,1);
          if (choice===0) gesture.to(reaction.current,{x:1.3,rotation:1.5,duration:.35}).to(reaction.current,{x:0,rotation:0,duration:.45});
          if (choice===1) gesture.to(glassesReaction.current,{y:1.5,duration:.2}).to(glassesReaction.current,{y:0,duration:.4,ease:'power2.out'});
          if (choice===2) gesture.to(comb.current,{rotation:1.3,duration:.16}).to(comb.current,{rotation:0,duration:.45,ease:'elastic.out(1,.45)'});
          if (choice===3) gesture.to(reaction.current,{rotation:-2,duration:.35}).to(reaction.current,{rotation:0,duration:.45});
        });
      };
      const resetGesture = () => {
        timer?.kill(); gesture?.kill();
        if (clicking) return;
        context.add(() => {
          gsap.killTweensOf(comb.current);
          gsap.to(comb.current,{rotation:0,duration:.25});
          gsap.to([reaction.current, glassesReaction.current], {x:0,y:0,rotation:0,scaleX:1,scaleY:1,duration:.25});
        });
      };
      const enter = (event:PointerEvent) => {
        if (!fine.matches || event.pointerType !== 'mouse') return;
        hovered=true; resetGesture();
        context.add(() => { gsap.to(track.current,{scale:1.04,duration:.25,ease:'power2.out'}); });
      };
      const move = (event:PointerEvent) => {
        if (!fine.matches || event.pointerType !== 'mouse' || !hovered) return;
        const bounds=logo.getBoundingClientRect();
        const x=gsap.utils.clamp(-1,1,((event.clientX-bounds.left)/bounds.width-.5)*2);
        const y=gsap.utils.clamp(-1,1,((event.clientY-bounds.top)/bounds.height-.5)*2);
        xTo(x*2.5); yTo(y*2); rotationTo(x*3); gxTo(x*1); gyTo(y*.5);
      };
      const leave = () => {
        hovered=false; xTo(0); yTo(0); rotationTo(0); gxTo(0); gyTo(0);
        context.add(() => { gsap.to(track.current,{scale:1,duration:.3}); });
        schedule();
      };
      const click = (event:MouseEvent) => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        resetGesture(); clicking=true;
        const now=performance.now(); clicks=clicks.filter(time=>now-time<1500); clicks.push(now);
        const surprise=clicks.length>=5;
        if (surprise) clicks=[];
        context.add(() => {
          clickAnimation?.kill(); gsap.killTweensOf([reaction.current,glassesReaction.current,comb.current]);
          clickAnimation=gsap.timeline({onComplete:()=>{clicking=false;schedule();}})
            .to(reaction.current,{scaleY:.94,scaleX:1.04,rotation:-2,duration:.14,ease:'power2.out'})
            .to(reaction.current,{scaleY:1.04,scaleX:.99,rotation:surprise?4:2,duration:.16})
            .to(reaction.current,{scaleY:1,scaleX:1,rotation:0,x:0,y:0,duration:.24,ease:'power2.out'});
          clickAnimation.to(glassesReaction.current,{y:2,duration:.14},0).to(glassesReaction.current,{y:0,duration:.3},.14);
          clickAnimation.to(comb.current,{rotation:surprise?-3:-1.5,duration:.14},0).to(comb.current,{rotation:0,duration:.4,ease:'elastic.out(1,.45)'},.14);
          if (surprise) {
            gsap.killTweensOf(egg.current);
            eggAnimation?.kill();
            eggAnimation=gsap.timeline().fromTo(egg.current,{autoAlpha:0,scale:0,y:0,rotation:-15},{autoAlpha:1,scale:1,duration:.16})
              .to(egg.current,{y:-15,rotation:15,duration:.38},.1).to(egg.current,{autoAlpha:0,scale:.7,duration:.2},.5);
          }
        });
        // The Link navigates immediately; Header remains mounted across client-side routes.
      };
      const visibility = () => {
        timer?.kill();
        if (document.hidden) {
          drift.pause(); breathe.pause(); combIdle.pause(); gesture?.pause(); clickAnimation?.pause(); eggAnimation?.pause();
          [xTo,yTo,rotationTo,gxTo,gyTo].forEach(quick=>quick.tween.pause());
        } else {
          drift.resume(); breathe.resume(); combIdle.resume();
          gesture?.resume(); clickAnimation?.resume(); eggAnimation?.resume(); schedule();
        }
      };
      logo.addEventListener('pointerenter',enter); logo.addEventListener('pointermove',move); logo.addEventListener('pointerleave',leave); logo.addEventListener('click',click);
      document.addEventListener('visibilitychange',visibility);
      schedule(); if (document.hidden) visibility();
      cleanup = () => {
        logo.removeEventListener('pointerenter',enter); logo.removeEventListener('pointermove',move); logo.removeEventListener('pointerleave',leave); logo.removeEventListener('click',click);
        document.removeEventListener('visibilitychange',visibility); context.revert();
      };
    };
    configure(); reduced.addEventListener('change',configure); fine.addEventListener('change',configure);
    return () => { cleanup(); reduced.removeEventListener('change',configure); fine.removeEventListener('change',configure); };
  }, []);

  return <Link ref={root} to="/" className="brand birdex-logo" aria-label="BIRDEX — Home" onClick={onNavigate}>
    <span className="birdex-mascot" aria-hidden="true"><span ref={idle} className="logo-transform"><span ref={track} className="logo-transform"><span ref={reaction} className="logo-transform">
      <span className="logo-layer" data-logo-part="head"><MascotLayer part="head" id={id}/></span>
      <span ref={combDrift} className="logo-layer"><span ref={comb} className="logo-transform" data-logo-part="comb"><MascotLayer part="comb" id={id}/></span></span>
      <span className="logo-layer" data-logo-part="beak"><MascotLayer part="beak" id={id}/></span>
      <span ref={glassesTrack} className="logo-layer"><span ref={glassesReaction} className="logo-transform" data-logo-part="glasses"><MascotLayer part="glasses" id={id}/></span></span>
    </span></span></span></span>
    <span className="birdex-wordmark">BIRDEX</span>
    <svg ref={egg} className="logo-golden-egg" viewBox="0 0 24 30" aria-hidden="true"><defs><linearGradient id={`${id}-egg`} x2="1" y2="1"><stop stopColor="#fff2a0"/><stop offset=".5" stopColor="#f3c23e"/><stop offset="1" stopColor="#b97519"/></linearGradient></defs><path d="M12 1C7 1 2 11 2 19a10 10 0 0020 0C22 11 17 1 12 1Z" fill={`url(#${id}-egg)`}/><path d="M7 18l1-5 4 3 4-3 1 5Z" fill="none" stroke="#fff4af" strokeWidth="1.2"/></svg>
  </Link>;
}
