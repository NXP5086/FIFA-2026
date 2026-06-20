import { createClient } from '@supabase/supabase-js';

// All 104 WC 2026 kickoff times in UTC (derived from data.js et() values).
// The function skips the external API call unless now is within [kickoff, kickoff + 3.5h)
// AND at least one in-window match is not yet 'final' in our DB.
// At 5-min intervals this caps daily usage at ~96 calls on the busiest days.
const KICKOFFS = {
  'G01':'2026-06-11T19:00:00Z','G02':'2026-06-12T02:00:00Z',
  'G07':'2026-06-12T19:00:00Z','G19':'2026-06-13T01:00:00Z',
  'G08':'2026-06-13T19:00:00Z','G13':'2026-06-13T22:00:00Z',
  'G14':'2026-06-14T01:00:00Z','G20':'2026-06-14T04:00:00Z',
  'G25':'2026-06-14T17:00:00Z','G31':'2026-06-14T20:00:00Z',
  'G26':'2026-06-14T23:00:00Z','G32':'2026-06-15T02:00:00Z',
  'G43':'2026-06-15T16:00:00Z','G37':'2026-06-15T19:00:00Z',
  'G44':'2026-06-15T22:00:00Z','G38':'2026-06-16T01:00:00Z',
  'G49':'2026-06-16T19:00:00Z','G50':'2026-06-16T22:00:00Z',
  'G55':'2026-06-17T01:00:00Z','G56':'2026-06-18T04:00:00Z',
  'G61':'2026-06-17T17:00:00Z','G67':'2026-06-17T20:00:00Z',
  'G68':'2026-06-17T23:00:00Z','G62':'2026-06-18T02:00:00Z',
  'G03':'2026-06-18T16:00:00Z','G09':'2026-06-18T19:00:00Z',
  'G10':'2026-06-18T22:00:00Z','G04':'2026-06-19T01:00:00Z',
  'G21':'2026-06-19T19:00:00Z','G15':'2026-06-19T22:00:00Z',
  'G16':'2026-06-20T01:00:00Z','G22':'2026-06-20T04:00:00Z',
  'G33':'2026-06-20T17:00:00Z','G27':'2026-06-20T20:00:00Z',
  'G28':'2026-06-21T00:00:00Z','G34':'2026-06-21T04:00:00Z',
  'G45':'2026-06-21T16:00:00Z','G39':'2026-06-21T19:00:00Z',
  'G46':'2026-06-21T22:00:00Z','G40':'2026-06-22T01:00:00Z',
  'G57':'2026-06-22T17:00:00Z','G51':'2026-06-22T21:00:00Z',
  'G52':'2026-06-23T00:00:00Z','G58':'2026-06-23T03:00:00Z',
  'G63':'2026-06-23T17:00:00Z','G69':'2026-06-23T20:00:00Z',
  'G70':'2026-06-23T23:00:00Z','G64':'2026-06-24T02:00:00Z',
  'G11':'2026-06-24T19:00:00Z','G12':'2026-06-24T19:00:00Z',
  'G17':'2026-06-24T22:00:00Z','G18':'2026-06-24T22:00:00Z',
  'G05':'2026-06-25T01:00:00Z','G06':'2026-06-25T01:00:00Z',
  'G29':'2026-06-25T20:00:00Z','G30':'2026-06-25T20:00:00Z',
  'G35':'2026-06-25T23:00:00Z','G36':'2026-06-25T23:00:00Z',
  'G23':'2026-06-26T02:00:00Z','G24':'2026-06-26T02:00:00Z',
  'G53':'2026-06-26T19:00:00Z','G54':'2026-06-26T19:00:00Z',
  'G47':'2026-06-27T00:00:00Z','G48':'2026-06-27T00:00:00Z',
  'G41':'2026-06-27T03:00:00Z','G42':'2026-06-27T03:00:00Z',
  'G71':'2026-06-27T21:00:00Z','G72':'2026-06-27T21:00:00Z',
  'G65':'2026-06-27T23:30:00Z','G66':'2026-06-27T23:30:00Z',
  'G59':'2026-06-28T02:00:00Z','G60':'2026-06-28T02:00:00Z',
  'M73':'2026-06-28T19:00:00Z',
  'M76':'2026-06-29T17:00:00Z','M74':'2026-06-29T20:30:00Z','M75':'2026-06-30T01:00:00Z',
  'M78':'2026-06-30T17:00:00Z','M77':'2026-06-30T21:00:00Z','M79':'2026-07-01T01:00:00Z',
  'M80':'2026-07-01T16:00:00Z','M82':'2026-07-01T20:00:00Z','M81':'2026-07-02T00:00:00Z',
  'M84':'2026-07-02T19:00:00Z','M83':'2026-07-02T23:00:00Z','M85':'2026-07-03T03:00:00Z',
  'M88':'2026-07-03T18:00:00Z','M86':'2026-07-03T22:00:00Z','M87':'2026-07-04T01:30:00Z',
  'M90':'2026-07-04T17:00:00Z','M89':'2026-07-04T21:00:00Z',
  'M91':'2026-07-05T20:00:00Z','M92':'2026-07-06T00:00:00Z',
  'M93':'2026-07-06T19:00:00Z','M94':'2026-07-07T00:00:00Z',
  'M95':'2026-07-07T16:00:00Z','M96':'2026-07-07T20:00:00Z',
  'M97':'2026-07-09T20:00:00Z',
  'M98':'2026-07-10T20:00:00Z',
  'M99':'2026-07-11T16:00:00Z','M100':'2026-07-11T20:00:00Z',
  'M101':'2026-07-14T19:00:00Z',
  'M102':'2026-07-15T19:00:00Z',
  'M103':'2026-07-18T19:00:00Z',
  'M104':'2026-07-19T19:00:00Z',
};

const GROUP_WINDOW_MS = 2.75 * 60 * 60 * 1000; // 2h45m — group games can't go to ET
const KO_WINDOW_MS    = 3.5  * 60 * 60 * 1000; // 3h30m — covers ET + penalties

// ESPN team abbreviation → our internal team code (only where they differ)
const ESPN_MAP = {
  'IRI': 'IRN',  // Iran (ESPN sometimes uses IRI)
  'KSA': 'SAU',  // Saudi Arabia (ESPN uses KSA, we use SAU)
};

// Group-stage match index: "HOME-AWAY" → our internal match ID
const GROUP_INDEX = {
  'MEX-RSA': 'G01', 'KOR-CZE': 'G02', 'CZE-RSA': 'G03', 'MEX-KOR': 'G04', 'CZE-MEX': 'G05', 'RSA-KOR': 'G06',
  'CAN-BIH': 'G07', 'QAT-SUI': 'G08', 'SUI-BIH': 'G09', 'CAN-QAT': 'G10', 'SUI-CAN': 'G11', 'BIH-QAT': 'G12',
  'BRA-MAR': 'G13', 'HAI-SCO': 'G14', 'SCO-MAR': 'G15', 'BRA-HAI': 'G16', 'SCO-BRA': 'G17', 'MAR-HAI': 'G18',
  'USA-PAR': 'G19', 'AUS-TUR': 'G20', 'USA-AUS': 'G21', 'TUR-PAR': 'G22', 'TUR-USA': 'G23', 'PAR-AUS': 'G24',
  'GER-CUW': 'G25', 'CIV-ECU': 'G26', 'GER-CIV': 'G27', 'ECU-CUW': 'G28', 'ECU-GER': 'G29', 'CUW-CIV': 'G30',
  'NED-JPN': 'G31', 'SWE-TUN': 'G32', 'NED-SWE': 'G33', 'TUN-JPN': 'G34', 'JPN-SWE': 'G35', 'TUN-NED': 'G36',
  'BEL-EGY': 'G37', 'IRN-NZL': 'G38', 'BEL-IRN': 'G39', 'NZL-EGY': 'G40', 'EGY-IRN': 'G41', 'NZL-BEL': 'G42',
  'ESP-CPV': 'G43', 'SAU-URU': 'G44', 'ESP-SAU': 'G45', 'URU-CPV': 'G46', 'CPV-SAU': 'G47', 'URU-ESP': 'G48',
  'FRA-SEN': 'G49', 'IRQ-NOR': 'G50', 'FRA-IRQ': 'G51', 'NOR-SEN': 'G52', 'NOR-FRA': 'G53', 'SEN-IRQ': 'G54',
  'ARG-ALG': 'G55', 'AUT-JOR': 'G56', 'ARG-AUT': 'G57', 'JOR-ALG': 'G58', 'ALG-AUT': 'G59', 'JOR-ARG': 'G60',
  'POR-COD': 'G61', 'UZB-COL': 'G62', 'POR-UZB': 'G63', 'COL-COD': 'G64', 'COL-POR': 'G65', 'COD-UZB': 'G66',
  'ENG-CRO': 'G67', 'GHA-PAN': 'G68', 'ENG-GHA': 'G69', 'PAN-CRO': 'G70', 'PAN-ENG': 'G71', 'CRO-GHA': 'G72',
};

// KO match index: kickoff UTC ms → match ID (±5 min tolerance)
function etMs(dateStr, hour, min, next) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d + (next ? 1 : 0), hour + 4, min || 0, 0);
}
const KO_BY_MIN = new Map([
  [etMs('2026-06-28', 15, 0), 'M73'],  [etMs('2026-06-29', 16, 30), 'M74'],
  [etMs('2026-06-29', 21, 0), 'M75'],  [etMs('2026-06-29', 13, 0), 'M76'],
  [etMs('2026-06-30', 17, 0), 'M77'],  [etMs('2026-06-30', 13, 0), 'M78'],
  [etMs('2026-06-30', 21, 0), 'M79'],  [etMs('2026-07-01', 12, 0), 'M80'],
  [etMs('2026-07-01', 20, 0), 'M81'],  [etMs('2026-07-01', 16, 0), 'M82'],
  [etMs('2026-07-02', 19, 0), 'M83'],  [etMs('2026-07-02', 15, 0), 'M84'],
  [etMs('2026-07-02', 23, 0), 'M85'],  [etMs('2026-07-03', 18, 0), 'M86'],
  [etMs('2026-07-03', 21, 30), 'M87'], [etMs('2026-07-03', 14, 0), 'M88'],
  [etMs('2026-07-04', 17, 0), 'M89'],  [etMs('2026-07-04', 13, 0), 'M90'],
  [etMs('2026-07-05', 16, 0), 'M91'],  [etMs('2026-07-05', 20, 0), 'M92'],
  [etMs('2026-07-06', 15, 0), 'M93'],  [etMs('2026-07-06', 20, 0), 'M94'],
  [etMs('2026-07-07', 12, 0), 'M95'],  [etMs('2026-07-07', 16, 0), 'M96'],
  [etMs('2026-07-09', 16, 0), 'M97'],  [etMs('2026-07-10', 16, 0), 'M98'],
  [etMs('2026-07-11', 12, 0), 'M99'],  [etMs('2026-07-11', 16, 0), 'M100'],
  [etMs('2026-07-14', 15, 0), 'M101'], [etMs('2026-07-15', 15, 0), 'M102'],
  [etMs('2026-07-18', 15, 0), 'M103'], [etMs('2026-07-19', 15, 0), 'M104'],
]);

function resolveMatchId(homeCode, awayCode, kickoffDate) {
  const key = `${homeCode}-${awayCode}`;
  if (GROUP_INDEX[key]) return GROUP_INDEX[key];
  const kickoffMs = new Date(kickoffDate).getTime();
  for (const [ms, id] of KO_BY_MIN) {
    if (Math.abs(kickoffMs - ms) <= 5 * 60 * 1000) return id;
  }
  return null;
}

// Derive ending type from ESPN status name
function getEnding(statusName) {
  const n = statusName.toUpperCase();
  if (n.includes('PENALT') || n.includes('SHOOTOUT')) return 'PENS';
  if (n.includes('EXTRA') || n.includes('AET') || n.includes('OVERTIME')) return 'ET';
  return 'NT';
}

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
const fmtDate = d => d.toISOString().split('T')[0].replace(/-/g, '');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const debug = req.query?.debug === '1';

  const supabaseUrl     = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseService = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseService) {
    return res.status(500).json({ error: 'Missing env vars: SUPABASE_URL/VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY' });
  }

  const supabase = createClient(supabaseUrl, supabaseService);

  const now   = new Date();
  const nowMs = now.getTime();

  // Guard: only call the external API while a match is in its live window.
  const inWindowIds = Object.entries(KICKOFFS)
    .filter(([id, kickoff]) => {
      const ko = new Date(kickoff).getTime();
      const windowMs = id.startsWith('M') ? KO_WINDOW_MS : GROUP_WINDOW_MS;
      return nowMs >= ko && nowMs < ko + windowMs;
    })
    .map(([id]) => id);

  if (inWindowIds.length === 0) {
    return res.status(200).json({ updated: 0, skipped: true, reason: 'no matches in live window' });
  }

  // Stop polling once all in-window matches are already final in our DB.
  const { data: notFinal } = await supabase
    .from('match_results').select('match_id')
    .in('match_id', inWindowIds).neq('status', 'final').limit(1);
  const { data: existing } = await supabase
    .from('match_results').select('match_id').in('match_id', inWindowIds);
  const existingSet = new Set((existing ?? []).map(r => r.match_id));
  const hasUnsynced = inWindowIds.some(id => !existingSet.has(id));

  if (!hasUnsynced && (!notFinal || notFinal.length === 0)) {
    return res.status(200).json({ updated: 0, skipped: true, reason: 'all in-window matches already final' });
  }

  // Fetch ESPN scoreboard for today and yesterday (covers games that kicked off before UTC midnight).
  const yesterday = new Date(nowMs - 24 * 60 * 60 * 1000);
  let allEvents = [];
  const fetchErrors = [];

  for (const d of [yesterday, now]) {
    try {
      const r = await fetch(`${ESPN_BASE}?dates=${fmtDate(d)}`);
      if (!r.ok) { fetchErrors.push(`ESPN ${fmtDate(d)}: HTTP ${r.status}`); continue; }
      const data = await r.json();
      allEvents.push(...(data.events || []));
    } catch (e) {
      fetchErrors.push(`ESPN ${fmtDate(d)}: ${e.message}`);
    }
  }

  if (debug) {
    return res.status(200).json({
      fetchErrors,
      events: allEvents.map(ev => {
        const comp = ev.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === 'home');
        const away = comp.competitors.find(c => c.homeAway === 'away');
        return {
          name: ev.name, date: ev.date,
          statusName: comp.status.type.name,
          state: comp.status.type.state,
          displayClock: comp.status.displayClock,
          homeAbbr: home?.team?.abbreviation, homeScore: home?.score,
          awayAbbr: away?.team?.abbreviation, awayScore: away?.score,
        };
      }),
    });
  }

  const upserts = [];
  const skipped = [];

  for (const event of allEvents) {
    const comp       = event.competitions[0];
    const statusType = comp.status.type;
    const state      = statusType.state; // 'pre' | 'in' | 'post'

    if (state !== 'in' && state !== 'post') continue;

    const home = comp.competitors.find(c => c.homeAway === 'home');
    const away = comp.competitors.find(c => c.homeAway === 'away');
    if (!home || !away) continue;

    const homeAbbr = home.team?.abbreviation;
    const awayAbbr = away.team?.abbreviation;
    const homeCode = ESPN_MAP[homeAbbr] ?? homeAbbr;
    const awayCode = ESPN_MAP[awayAbbr] ?? awayAbbr;

    if (!homeCode || !awayCode) {
      skipped.push({ reason: 'missing abbreviation', home: homeAbbr, away: awayAbbr });
      continue;
    }

    const matchId = resolveMatchId(homeCode, awayCode, event.date);
    if (!matchId) {
      skipped.push({ reason: 'no match id', home: homeCode, away: awayCode, date: event.date });
      continue;
    }

    const isKO     = matchId.startsWith('M');
    const homeScore = parseInt(home.score ?? '0', 10);
    const awayScore = parseInt(away.score ?? '0', 10);

    const row = { match_id: matchId };

    if (state === 'post') {
      const ending = getEnding(statusType.name);

      let finalHome = homeScore;
      let finalAway = awayScore;
      if (ending === 'PENS') {
        // ESPN stores the penalty shootout score in a linescore period
        const penHome = home.linescores?.find(l => l.type === 'penalty' || l.abbreviation === 'P');
        const penAway = away.linescores?.find(l => l.type === 'penalty' || l.abbreviation === 'P');
        if (penHome?.value != null) finalHome = parseInt(penHome.value, 10);
        if (penAway?.value != null) finalAway = parseInt(penAway.value, 10);
      }

      row.status      = 'final';
      row.home_score  = finalHome;
      row.away_score  = finalAway;
      row.live_minute = null;
      if (isKO) row.ending = ending;
    } else {
      const minute = parseInt(comp.status.displayClock, 10);
      row.status      = 'live';
      row.home_score  = homeScore;
      row.away_score  = awayScore;
      row.live_minute = Number.isNaN(minute) ? null : minute;
    }

    if (isKO) {
      row.home_code = homeCode;
      row.away_code = awayCode;
    }

    upserts.push(row);
  }

  if (upserts.length === 0) {
    return res.status(200).json({ updated: 0, skipped, fetchErrors, message: 'No active matches right now' });
  }

  const { error } = await supabase
    .from('match_results')
    .upsert(upserts, { onConflict: 'match_id' });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({
    updated: upserts.length,
    matches: upserts.map(u => `${u.match_id} (${u.status})`),
    skipped,
    fetchErrors,
  });
}
