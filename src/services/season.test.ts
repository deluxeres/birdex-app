import { describe, expect, it } from 'vitest';
import { validateSeason } from './season';
import { mockSeason } from './mock';
import { seasonProgress } from '../components/SeasonPreview';
describe('public season boundary',()=>{
 it('accepts the documented API shape',()=>expect(validateSeason(mockSeason)).toEqual(mockSeason));
 it('rejects invalid statistics and dates',()=>{expect(()=>validateSeason({...mockSeason,totalBirdPoints:-1})).toThrow();expect(()=>validateSeason({...mockSeason,endsAt:'bad'})).toThrow();expect(()=>validateSeason({...mockSeason,endsAt:mockSeason.startsAt})).toThrow();});
 it('clamps progress outside the season and calculates midpoint',()=>{const start=Date.parse(mockSeason.startsAt),end=Date.parse(mockSeason.endsAt);expect(seasonProgress(mockSeason,start-1000)).toBe(0);expect(seasonProgress(mockSeason,end+1000)).toBe(100);expect(seasonProgress(mockSeason,(start+end)/2)).toBe(50);});
});
