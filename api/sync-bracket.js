import { createClient } from '@supabase/supabase-js';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
const fmtDate = d => d.toISOString().split('T')[0].replace(/-/g, '');

// ESPN team abbreviation → our internal team code (only where they differ)
const ESPN_MAP = {
  'IRI': 'IRN',   // Iran
  'KSA': 'SAU',   // Saudi Arabia
  'SAF': 'RSA',   // South Africa
  'CUR': 'CUW',   // Curaçao
  'CVI': 'CPV',   // Cape Verde
  'DRC': 'COD',   // DR Congo
  'CGO': 'COD',   // DR Congo (alt)
  'BOS': 'BIH',   // Bosnia & Herzegovina
};

// All KO match kickoffs (UTC) → internal match ID
const KO_KICKOFFS = {
  'M73': '2026-06-28T19:00:00Z',
  'M76': '2026-06-29T17:00:00Z', 'M74': '2026-06-29T20:30:00Z', 'M75': '2026-06-30T01:00:00Z',
  'M78': '2026-06-30T17:00:00Z', 'M77': '2026-06-30T21:00:00Z', 'M79': '2026-07-01T01:00:00Z',
  'M80': '2026-07-01T16:00:00Z', 'M82': '2026-07-01T20:00:00Z', 'M81': '2026-07-02T00:00:00Z',
  'M84': '2026-07-02T19:00:00Z', 'M83': '2026-07-02T23:00:00Z', 'M85': '2026-07-03T03:00:00Z',
  'M88': '2026-07-03T18:00:00Z', 'M86': '2026-07-03T22:00:00Z', 'M87': '2026-07-04T01:30:00Z',
  'M90': '2026-07-04T17:00:00Z', 'M89': '2026-07-04T21:00:00Z',
  'M91': '2026-07-05T20:00:00Z', 'M92': '2026-07-06T00:00:00Z',
  'M93': '2026-07-06T19:00:00Z', 'M94': '2026-07-07T00:00:00Z',
  'M95': '2026-07-07T16:00:00Z', 'M96': '2026-07-07T20:00:00Z',
  'M97': '2026-07-09T20:00:00Z',
  'M98': '2026-07-10T20:00:00Z',
  'M99': '2026-07-11T16:00:00Z', 'M100': '2026-07-11T20:00:00Z',
  'M101': '2026-07-14T19:00:00Z',
  'M102': '2026-07-15T19:00:00Z',
  'M103': '2026-07-18T19:00:00Z',
  'M104': '2026-07-19T19:00:00Z',
};

const KO_BY_MS = Object.entries(KO_KICKOFFS).map(([id, utc]) => [new Date(utc).getTime(), id]);

function resolveKoMatchId(kickoffDate) {
  const kickoffMs = new Date(kickoffDate).getTime();
  for (const [ms, id] of KO_BY_MS) {
    if (Math.abs(kickoffMs - ms) <= 5 * 60 * 1000) return id;
  }
  return null;
}

export default async function handler(req, res) {
  const debug = req.query.debug === '1';

  const supabaseUrl     = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseService = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseService) {
    return res.status(500).json({ error: 'Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY' });
  }
  const supabase = createClient(supabaseUrl, supabaseService);

  const nowMs = Date.now();
  // Fetch ESPN for KO dates that fall within the next 14 days (and yesterday for UTC edge cases)
  const windowEnd = nowMs + 14 * 24 * 60 * 60 * 1000;
  const datesToFetch = [
    ...new Set(
      Object.values(KO_KICKOFFS)
        .filter(utc => {
          const t = new Date(utc).getTime();
          return t >= nowMs - 24 * 60 * 60 * 1000 && t <= windowEnd;
        })
        .map(utc => fmtDate(new Date(utc)))
    ),
  ];

  let allEvents = [];
  for (const dateStr of datesToFetch) {
    try {
      const r = await fetch(`${ESPN_BASE}?dates=${dateStr}`);
      if (!r.ok) continue;
      const data = await r.json();
      allEvents.push(...(data.events || []));
    } catch {}
  }

  // Debug mode: return raw ESPN data without writing to DB
  if (debug) {
    return res.status(200).json({
      fetched_dates: datesToFetch,
      events: allEvents.map(ev => {
        const comp = ev.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === 'home');
        const away = comp.competitors.find(c => c.homeAway === 'away');
        return {
          name: ev.name,
          date: ev.date,
          state: comp.status.type.state,
          homeAbbr: home?.team?.abbreviation,
          awayAbbr: away?.team?.abbreviation,
          resolvedMatchId: resolveKoMatchId(ev.date),
        };
      }),
    });
  }

  const candidates = [];
  const skipped    = [];

  for (const event of allEvents) {
    const comp  = event.competitions[0];
    const state = comp.status.type.state; // 'pre' | 'in' | 'post'

    // Only seed upcoming matches — live/final are handled by sync-scores
    if (state !== 'pre') continue;

    const home = comp.competitors.find(c => c.homeAway === 'home');
    const away = comp.competitors.find(c => c.homeAway === 'away');
    if (!home || !away) continue;

    const homeAbbr = home.team?.abbreviation ?? '';
    const awayAbbr = away.team?.abbreviation ?? '';
    const homeCode = ESPN_MAP[homeAbbr] ?? homeAbbr;
    const awayCode = ESPN_MAP[awayAbbr] ?? awayAbbr;

    // Skip if ESPN doesn't know the teams yet
    if (
      !homeCode || !awayCode ||
      homeCode.length > 5 || awayCode.length > 5 ||
      homeCode.toUpperCase() === 'TBD' || awayCode.toUpperCase() === 'TBD'
    ) {
      skipped.push({ reason: 'unknown teams', home: homeCode, away: awayCode, date: event.date });
      continue;
    }

    const matchId = resolveKoMatchId(event.date);
    if (!matchId) {
      skipped.push({ reason: 'no match id', home: homeCode, away: awayCode, date: event.date });
      continue;
    }

    candidates.push({ match_id: matchId, home_code: homeCode, away_code: awayCode });
  }

  if (candidates.length === 0) {
    return res.status(200).json({ updated: 0, skipped, message: 'No upcoming KO teams found from ESPN yet' });
  }

  // Fetch existing rows to avoid overwriting live/final records
  const matchIds = candidates.map(c => c.match_id);
  const { data: existing } = await supabase
    .from('match_results')
    .select('match_id, status')
    .in('match_id', matchIds);

  const existingMap = {};
  (existing || []).forEach(r => { existingMap[r.match_id] = r.status; });

  const toInsert = [];
  const toUpdate = [];

  for (const c of candidates) {
    const st = existingMap[c.match_id];
    if (!st) {
      toInsert.push({ ...c, status: 'upcoming' });
    } else if (st === 'upcoming') {
      toUpdate.push(c);
    }
    // 'live' or 'final' → sync-scores already wrote the codes; skip
  }

  let updated = 0;

  if (toInsert.length > 0) {
    const { error } = await supabase.from('match_results').insert(toInsert);
    if (error) return res.status(500).json({ error: error.message, phase: 'insert' });
    updated += toInsert.length;
  }

  for (const u of toUpdate) {
    const { error } = await supabase
      .from('match_results')
      .update({ home_code: u.home_code, away_code: u.away_code })
      .eq('match_id', u.match_id)
      .eq('status', 'upcoming');
    if (!error) updated++;
  }

  return res.status(200).json({
    updated,
    matches: [...toInsert, ...toUpdate].map(u => `${u.match_id}: ${u.home_code} vs ${u.away_code}`),
    skipped,
    fetched_dates: datesToFetch,
  });
}
