/**
 * Everything on the public grid of instagram.com/swastik.mov, read on 4 Oct 2026.
 *
 * - `date` comes from each post's timestamp (spot-checked against the post page).
 * - `views` is the play count Instagram showed on the Reels tab that day, rounded
 *   the way Instagram rounds it ("149K" is stored as 149000). Photos have none.
 * - `caption` is the first line of the post's own caption, trimmed, in the
 *   author's words. Hashtags are left out.
 * - Covers live in /public/media/reels; the ten featured reels (the most watched,
 *   leaving out one political reel that stays in the archive) also ship a
 *   six-second silent preview and the full reel, re-encoded for the web.
 */

export type ReelKind = 'reel' | 'photo' | 'carousel';

export interface Reel {
  code: string;
  kind: ReelKind;
  date: string;
  /** The author's own numbering ("Post 29"), when the caption has one. */
  label?: string;
  caption: string;
  views?: number;
  /** Shape of the cover frame: most reels are shot landscape. */
  shape: 'wide' | 'tall';
  /** Ships a preview loop and the full reel (the ten featured reels). */
  video?: boolean;
  /** Kept in the archive but left out of the featured ten (a political reel). */
  unfeatured?: boolean;
  /** Where this reel meets the engineering work. */
  crossover?: string;
}

export const PROFILE = {
  handle: 'swastik.mov',
  url: 'https://www.instagram.com/swastik.mov/',
  bio: 'I post videos about my life here.',
  posts: 57,
  followers: 2297,
  readOn: '4 Oct 2026',
} as const;

/** Newest first, as on the grid (the pinned photo is placed by its date). */
export const REELS: Reel[] = [
  { code: 'DbD5Fk1N5vy', kind: 'reel', date: '2026-07-21', caption: 'If this offended you, ask yourself why.', views: 20100, shape: 'tall', unfeatured: true },
  { code: 'DasTBY3NCHC', kind: 'reel', date: '2026-07-12', caption: 'There are dozens of small habits that shape how people perceive you.', views: 6408, shape: 'wide' },
  { code: 'DY7IOGbEyLV', kind: 'carousel', date: '2026-05-29', caption: 'In the 🔁', shape: 'tall' },
  { code: 'DY1A0k7z3-T', kind: 'reel', date: '2026-05-27', caption: 'Share your experience if this scam ever happened to you or your friends.', views: 3466, shape: 'wide' },
  { code: 'DXUDSTEGU0U', kind: 'carousel', date: '2026-04-19', caption: 'Long time.', shape: 'tall' },
  { code: 'DWrDD0mjQVM', kind: 'reel', date: '2026-04-03', caption: 'The difference between a viewer and a creator: Viewers scroll. Creators study.', views: 5952, shape: 'wide' },
  { code: 'DVWGKm7kq48', kind: 'reel', date: '2026-03-01', caption: 'I don’t think people are scared of failing. They’re scared of failing where everyone can see it.', views: 5697, shape: 'wide' },
  { code: 'DULcaQxkjLz', kind: 'reel', date: '2026-01-31', caption: '🗻', views: 5847, shape: 'wide' },
  { code: 'DT2Nz0AkaEH', kind: 'photo', date: '2026-01-23', caption: 'Cold hands. Clear head. Loud memories.', shape: 'tall' },
  { code: 'DTx8bl8kl7Z', kind: 'reel', date: '2026-01-21', caption: 'Unrivalled.', views: 5543, shape: 'tall' },
  { code: 'DTvbnJpkgDH', kind: 'reel', date: '2026-01-20', caption: 'Timeless.', views: 6070, shape: 'tall' },
  { code: 'DTiCDYMkpsJ', kind: 'reel', date: '2026-01-15', label: 'Post 45', caption: 'Canon event.', views: 7946, shape: 'tall' },
  { code: 'DTZ0b01kV2a', kind: 'reel', date: '2026-01-12', label: 'Post 44', caption: 'Some reactions stay longer than the moment itself.', views: 4431, shape: 'wide' },
  { code: 'DTTJocCknVv', kind: 'reel', date: '2026-01-09', label: 'Post 43', caption: 'Kept it in long enough.', views: 4055, shape: 'wide' },
  { code: 'DTN6TbbkkWq', kind: 'reel', date: '2026-01-07', label: 'Post 42', caption: 'Academic comeback sponsored by stress.', views: 4122, shape: 'wide' },
  { code: 'DTF8JTSEmeG', kind: 'reel', date: '2026-01-04', label: 'Post 41', caption: 'Didn’t expect this. Didn’t get it for free either.', views: 5896, shape: 'wide' },
  { code: 'DTDajdXkkzX', kind: 'reel', date: '2026-01-03', label: 'Post 40', caption: 'This video only makes sense when you’re out of ideas.', views: 5833, shape: 'wide' },
  { code: 'DS-PXZDEhn0', kind: 'reel', date: '2026-01-01', label: 'Post 39', caption: 'Views are easy to get. So is becoming a joke.', views: 17700, shape: 'tall', video: true },
  { code: 'DS5KnKZkvs8', kind: 'reel', date: '2025-12-30', label: 'Post 38', caption: 'If this triggered you, it wasn’t meant to comfort you.', views: 4381, shape: 'wide' },
  { code: 'DS2pPBCEjta', kind: 'reel', date: '2025-12-29', label: 'Post 37', caption: 'Some people watch quietly. And that’s okay.', views: 5074, shape: 'wide' },
  { code: 'DS1Z53sEfWR', kind: 'reel', date: '2025-12-29', label: 'Post 36', caption: 'Comment “Font”.', views: 6200, shape: 'wide' },
  { code: 'DSw8ZTGkrq9', kind: 'reel', date: '2025-12-27', label: 'Post 35', caption: 'The reel that blew up wasn’t the lesson. The ones that didn’t were.', views: 6312, shape: 'wide' },
  { code: 'DSt3qfjkVUz', kind: 'reel', date: '2025-12-26', label: 'Post 34', caption: 'Anyone else feel like the third person in a pair?', views: 6353, shape: 'wide' },
  { code: 'DSrPaPjAVGq', kind: 'reel', date: '2025-12-25', caption: 'Relatable enough?', views: 5343, shape: 'tall' },
  { code: 'DSpaKCdEsR_', kind: 'reel', date: '2025-12-24', label: 'Post 32', caption: 'Thank you for being part of this.', views: 12900, shape: 'wide', video: true },
  { code: 'DSl3imZklIp', kind: 'reel', date: '2025-12-23', label: 'Post 31', caption: 'Some cases become examples of “the system working.”', views: 4554, shape: 'wide' },
  { code: 'DSjJMtXEsCQ', kind: 'reel', date: '2025-12-22', label: 'Post 30', caption: 'Real friendships aren’t always comfortable.', views: 5250, shape: 'tall' },
  { code: 'DSg5RsdEQIh', kind: 'reel', date: '2025-12-21', label: 'Post 29', caption: 'Comment “BGM”.', views: 149000, shape: 'wide', video: true },
  { code: 'DSeM7JykR3z', kind: 'reel', date: '2025-12-20', label: 'Post 28', caption: 'Rather Lie ft. LPU.', views: 8280, shape: 'wide', video: true, crossover: 'An edit of the LPU campus, the university LPU Reserve is built for.' },
  { code: 'DSbaZczEvUy', kind: 'reel', date: '2025-12-19', label: 'Post 27', caption: 'Filters don’t just change your face. They change what your brain accepts as normal.', views: 17800, shape: 'wide', video: true },
  { code: 'DSZnRl7EROu', kind: 'reel', date: '2025-12-18', label: 'Post 26', caption: 'Comfort isn’t peace. It’s a pause button.', views: 3048, shape: 'wide' },
  { code: 'DSWbE9qkgRU', kind: 'reel', date: '2025-12-17', label: 'Post 25', caption: 'One good clip is built on dozens of bad ones.', views: 8674, shape: 'tall', video: true },
  { code: 'DSTuTZjEnYl', kind: 'reel', date: '2025-12-16', label: 'Post 24', caption: 'I chose the hardest paths thinking they’d make me strong.', views: 106000, shape: 'wide', video: true },
  { code: 'DSRUEJakl07', kind: 'reel', date: '2025-12-15', label: 'Post 23', caption: 'Can you standout?', views: 56700, shape: 'tall', video: true },
  { code: 'DSP9j4fAroh', kind: 'reel', date: '2025-12-14', label: 'Post 22', caption: 'Most content doesn’t fail because the edit is bad. It fails because it isn’t lived.', views: 3797, shape: 'wide' },
  { code: 'DSNNuocEtW7', kind: 'reel', date: '2025-12-13', label: 'Post 21', caption: 'People who know you remember your past.', views: 6218, shape: 'wide' },
  { code: 'DSK4f7ugtub', kind: 'reel', date: '2025-12-12', label: 'Post 20', caption: '9–5 classes wiped me out today.', views: 2697, shape: 'tall' },
  { code: 'DSITNz7kqA4', kind: 'reel', date: '2025-12-11', label: 'Post 19', caption: 'Recording outside felt stupidly uncomfortable…', views: 24200, shape: 'wide', video: true, crossover: 'Recorded on the LPU campus, the one LPU Reserve is built for.' },
  { code: 'DSF6qRKkhan', kind: 'reel', date: '2025-12-10', label: 'Post 18', caption: '200 isn’t viral. It’s not flex-worthy. But it’s real.', views: 3916, shape: 'wide' },
  { code: 'DSDH8V5ksqF', kind: 'reel', date: '2025-12-09', label: 'Post 17', caption: 'Most creators aren’t fearless. They just stopped asking for permission.', views: 3689, shape: 'wide' },
  { code: 'DSAhUsQkllC', kind: 'reel', date: '2025-12-08', label: 'Post 16', caption: 'Some words are meant to hurt you.', views: 3460, shape: 'tall' },
  { code: 'DR7etYQkr7f', kind: 'reel', date: '2025-12-06', label: 'Post 15', caption: 'I waited because I thought I had to feel ready. Turns out, readiness comes after you start.', views: 3938, shape: 'wide' },
  { code: 'DR2V4woESAu', kind: 'reel', date: '2025-12-04', label: 'Post 14/14', caption: 'Started at 0. 14 days of posting without skipping.', views: 7843, shape: 'wide' },
  { code: 'DRzv7OzEvl4', kind: 'reel', date: '2025-12-03', label: 'Post 13/14', caption: 'The worst mistake you can make when you’re young isn’t failing.', views: 4262, shape: 'wide' },
  { code: 'DRw_MEuEiOz', kind: 'reel', date: '2025-12-02', label: 'Post 12/14', caption: '', views: 4263, shape: 'wide' },
  { code: 'DRtKzxxEpJI', kind: 'reel', date: '2025-12-01', label: 'Post 11/14', caption: 'I wish I was as cool as him.', views: 4454, shape: 'tall' },
  { code: 'DRr53uLkmqy', kind: 'reel', date: '2025-11-30', label: 'Post 10/14', caption: '', views: 4035, shape: 'wide' },
  { code: 'DRpRhdAEmNU', kind: 'reel', date: '2025-11-29', label: 'Post 09/14', caption: '', views: 6802, shape: 'tall' },
  { code: 'DRmjZ41Elv4', kind: 'reel', date: '2025-11-28', label: 'Post 08/14', caption: 'This never went mainstream. And that’s criminal.', views: 3710, shape: 'wide' },
  { code: 'DRh5EVpEsWR', kind: 'reel', date: '2025-11-26', label: 'Post 07/14', caption: '', views: 6126, shape: 'wide' },
  { code: 'DRgMOlSkpG2', kind: 'reel', date: '2025-11-26', label: 'Post 06/14', caption: 'Not starting it was the problem I guess.', views: 8102, shape: 'tall' },
  { code: 'DRfGDS1gkMj', kind: 'reel', date: '2025-11-25', label: 'Post 05/14', caption: '', views: 34800, shape: 'wide', video: true },
  { code: 'DRciYp3kpUn', kind: 'reel', date: '2025-11-24', label: 'Post 04/14', caption: '', views: 4982, shape: 'tall' },
  { code: 'DRZ16joEnBu', kind: 'reel', date: '2025-11-23', label: 'Post 03/14', caption: '', views: 3299, shape: 'tall' },
  { code: 'DRWHAlRkgiH', kind: 'reel', date: '2025-11-22', label: 'Post 2/14', caption: 'I know better.', views: 3822, shape: 'tall' },
  { code: 'DRUXT1_Enrm', kind: 'reel', date: '2025-11-21', label: 'Post 1/14', caption: '', views: 3676, shape: 'tall' },
];

/** Oldest first: the order they were made in. */
export const REELS_CHRONO = [...REELS].sort((a, b) => a.date.localeCompare(b.date) || REELS.indexOf(b) - REELS.indexOf(a));

/** The ten featured reels: the most watched, minus any left out on purpose, most watched first. */
export const TOP_REELS = REELS.filter((r) => r.views && !r.unfeatured)
  .sort((a, b) => b.views! - a.views!)
  .slice(0, 10);

export const reelUrl = (r: Reel) => `https://www.instagram.com/${r.kind === 'reel' ? 'reel' : 'p'}/${r.code}/`;
export const coverSrc = (r: Reel) => `/media/reels/covers/${r.code}.webp`;
export const thumbSrc = (r: Reel) => `/media/reels/thumbs/${r.code}.webp`;
export const previewSrc = (r: Reel) => `/media/reels/${r.code}.preview.mp4`;
export const fullSrc = (r: Reel) => `/media/reels/${r.code}.mp4`;

/** Views summed over every reel. Instagram rounds large counts, so present this rounded down (see `viewsFloor`). */
export const TOTAL_VIEWS = REELS.reduce((s, r) => s + (r.views ?? 0), 0);
export const REEL_COUNT = REELS.filter((r) => r.kind === 'reel').length;

/** Moments worth a marker on the timeline (by post). */
export const MARKERS: Record<string, string> = {
  DRUXT1_Enrm: 'Post 1/14: the start',
  DR2V4woESAu: '14 days, no skipping',
  DSITNz7kqA4: 'LPU, on camera',
  DSg5RsdEQIh: '149K: most watched',
  DTiCDYMkpsJ: 'Post 45: last numbered',
  DT2Nz0AkaEH: 'Himachal',
};

/** The numbered daily run: "Post 1/14" on 21 Nov 2025 to "Post 45" on 15 Jan 2026. */
export const STREAK = { first: '2025-11-21', last: '2026-01-15', posts: 45 } as const;

/** As Instagram shows it: exact below 10,000, then thousands ("56.7K", "149K"). */
export const fmtViews = (n: number) =>
  n < 10000 ? n.toLocaleString('en-US') : `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}K`;

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });

/** A caption as a quotation, without doubling quotes it already has. */
export const quoted = (c: string) => (/[“”"]/.test(c) ? c : `“${c}”`);

/** Total views, rounded down to the ten thousand: safe however Instagram rounded each count. */
export const viewsFloor = () => `${Math.floor(TOTAL_VIEWS / 10000) * 10}K+`;
