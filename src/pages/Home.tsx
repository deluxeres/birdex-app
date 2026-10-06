import { Hero } from '../components/Hero';
import { SeasonPreview } from '../components/SeasonPreview';
import { TelegramCTA } from '../components/TelegramCTA';
import type { useData } from '../hooks/useData';
export function Home({data,onMissing}:{data:ReturnType<typeof useData>;onMissing:()=>void}) {return <><Hero onMissing={onMissing}/><SeasonPreview {...data}/><TelegramCTA onMissing={onMissing}/></>;}
