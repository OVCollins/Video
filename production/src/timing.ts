import timing from './data/timing.json';
import sections from './data/sections.json';

export const FPS = 30;
export const TIMING = timing as {
  total: number;
  leadIn: number;
  cues: {id: string; text: string; phonemes: string; start: number; end: number; onsets: number[]; items?: number[]; hit?: number}[];
};
export const SECTIONS = sections as Record<string, number>;
export const DURATION_FRAMES = Math.ceil(TIMING.total * FPS);

export const f = (sec: number) => Math.round(sec * FPS);
export const cue = (id: string) => {
  const c = TIMING.cues.find((x) => x.id === id);
  if (!c) throw new Error('Unknown cue ' + id);
  return c;
};
/** start frame of a cue */
export const cs = (id: string) => f(cue(id).start);
export const ce = (id: string) => f(cue(id).end);

/** Approximate onset (seconds) of each comma-separated item inside a cue,
 * weighted by phoneme length — used for the choir roll-call. */
export const itemOnsets = (id: string): number[] => {
  const c = cue(id);
  if (c.items) return c.items; // measured onsets (recorded narration)
  const parts = c.phonemes.split(/,| ænd /).map((p) => p.trim()).filter(Boolean);
  const lens = parts.map((p) => p.replace(/[ˈˌː\s.]/g, '').length + 3);
  const tot = lens.reduce((a, b) => a + b, 0);
  const dur = c.end - c.start;
  const out: number[] = [];
  let acc = 0;
  for (const l of lens) {
    out.push(c.start + (acc / tot) * dur);
    acc += l;
  }
  return out;
};
