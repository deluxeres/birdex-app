import { AppLink } from './AppLink';
import { Reveal } from './motion/Reveal';

export function TelegramCTA({onMissing}:{onMissing:()=>void}) {
  return <Reveal className="telegram-cta surface">
    <div className="cta-copy"><div className="eyebrow">YOUR FARM. IN YOUR POCKET.</div><h2>Open in Telegram.</h2><p>No downloads. Just a little chicken business.</p><AppLink onMissing={onMissing}/></div>
    <img className="telegram-art" src="/assets/telegram-phone.webp" alt="BIRDEX on a smartphone surrounded by golden eggs" width="1888" height="833" loading="lazy"/>
  </Reveal>;
}
