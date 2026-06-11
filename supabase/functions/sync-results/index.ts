// sync-results — Supabase Edge Function
// Fetches live FIFA World Cup 2026 scores from football-data.org
// and writes them to the match_results table.
//
// Deploy:  supabase functions deploy sync-results
// Secret:  supabase secrets set FOOTBALL_DATA_API_KEY=your_key
// Cron:    schedule every 5 min via Supabase Dashboard → Edge Functions → schedule
//
// Rate-limit strategy: the function fires every 5 min but calls the external API
// ONLY while a match is in progress (kickoff ≤ now < kickoff + 3.5 h AND match is
// not yet 'final' in our DB). Once all in-progress matches are final it stops
// immediately. This keeps daily API usage well under the 100-request free-tier limit
// even on the busiest days (max 4 simultaneous windows × ~24 calls = ~96 calls).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FOOTBALL_API_KEY = Deno.env.get('FOOTBALL_DATA_API_KEY') ?? '';
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// All 104 WC 2026 kickoff times in UTC, derived from data.js et() values.
// A "live window" is defined as [kickoff, kickoff + 3.5 h) — covers 90 min +
// half-time + stoppage + extra time + penalties + a small buffer.
const KICKOFFS: Record<string, string> = {
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

const WINDOW_MS = 3.5 * 60 * 60 * 1000; // 3.5 hours in ms

// Map from football-data.org team TLA → our team code (where they differ)
const CODE_MAP: Record<string, string> = {
  'BOS': 'BIH',
  'DRC': 'COD',
  'RSA': 'RSA',
  'USA': 'USA',
  'HAI': 'HAI',
  'CUW': 'CUW',
  'CPV': 'CPV',
};

function normalise(tla: string): string {
  return CODE_MAP[tla] ?? tla;
}

// Pre-built lookup: "HOME:AWAY" → our match ID for group stage
const GROUP_LOOKUP: Record<string, string> = {
  'MEX:RSA':'G01','KOR:CZE':'G02','CZE:RSA':'G03','MEX:KOR':'G04','CZE:MEX':'G05','RSA:KOR':'G06',
  'CAN:BIH':'G07','QAT:SUI':'G08','SUI:BIH':'G09','CAN:QAT':'G10','SUI:CAN':'G11','BIH:QAT':'G12',
  'BRA:MAR':'G13','HAI:SCO':'G14','SCO:MAR':'G15','BRA:HAI':'G16','SCO:BRA':'G17','MAR:HAI':'G18',
  'USA:PAR':'G19','AUS:TUR':'G20','USA:AUS':'G21','TUR:PAR':'G22','TUR:USA':'G23','PAR:AUS':'G24',
  'GER:CUW':'G25','CIV:ECU':'G26','GER:CIV':'G27','ECU:CUW':'G28','ECU:GER':'G29','CUW:CIV':'G30',
  'NED:JPN':'G31','SWE:TUN':'G32','NED:SWE':'G33','TUN:JPN':'G34','JPN:SWE':'G35','TUN:NED':'G36',
  'BEL:EGY':'G37','IRN:NZL':'G38','BEL:IRN':'G39','NZL:EGY':'G40','EGY:IRN':'G41','NZL:BEL':'G42',
  'ESP:CPV':'G43','SAU:URU':'G44','ESP:SAU':'G45','URU:CPV':'G46','CPV:SAU':'G47','URU:ESP':'G48',
  'FRA:SEN':'G49','IRQ:NOR':'G50','FRA:IRQ':'G51','NOR:SEN':'G52','NOR:FRA':'G53','SEN:IRQ':'G54',
  'ARG:ALG':'G55','AUT:JOR':'G56','ARG:AUT':'G57','JOR:ALG':'G58','ALG:AUT':'G59','JOR:ARG':'G60',
  'POR:COD':'G61','UZB:COL':'G62','POR:UZB':'G63','COL:COD':'G64','COL:POR':'G65','COD:UZB':'G66',
  'ENG:CRO':'G67','GHA:PAN':'G68','ENG:GHA':'G69','PAN:CRO':'G70','PAN:ENG':'G71','CRO:GHA':'G72',
};

// Knockout matches keyed by their UTC date prefix (YYYY-MM-DDTHH:MM)
const KO_DATE_LOOKUP: Record<string, string> = {
  '2026-06-28T19:00': 'M73', '2026-06-29T20:30': 'M74', '2026-06-30T01:00': 'M75',
  '2026-06-29T17:00': 'M76', '2026-06-30T21:00': 'M77', '2026-06-30T17:00': 'M78',
  '2026-07-01T01:00': 'M79', '2026-07-01T16:00': 'M80', '2026-07-02T00:00': 'M81',
  '2026-07-01T20:00': 'M82', '2026-07-02T23:00': 'M83', '2026-07-02T19:00': 'M84',
  '2026-07-03T03:00': 'M85', '2026-07-03T22:00': 'M86', '2026-07-04T01:30': 'M87',
  '2026-07-03T18:00': 'M88', '2026-07-04T21:00': 'M89', '2026-07-04T17:00': 'M90',
  '2026-07-05T20:00': 'M91', '2026-07-06T00:00': 'M92', '2026-07-06T19:00': 'M93',
  '2026-07-07T00:00': 'M94', '2026-07-07T16:00': 'M95', '2026-07-07T20:00': 'M96',
  '2026-07-09T20:00': 'M97', '2026-07-10T20:00': 'M98', '2026-07-11T16:00': 'M99',
  '2026-07-11T20:00': 'M100','2026-07-14T19:00': 'M101','2026-07-15T19:00': 'M102',
  '2026-07-18T19:00': 'M103','2026-07-19T19:00': 'M104',
};

function findMatchId(home: string, away: string, utcDate: string): string | null {
  const key = `${normalise(home)}:${normalise(away)}`;
  if (GROUP_LOOKUP[key]) return GROUP_LOOKUP[key];
  const datePfx = utcDate.slice(0, 16);
  if (KO_DATE_LOOKUP[datePfx]) return KO_DATE_LOOKUP[datePfx];
  return null;
}

function mapStatus(apiStatus: string): 'upcoming' | 'live' | 'final' {
  if (['FINISHED'].includes(apiStatus)) return 'final';
  if (['IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'].includes(apiStatus)) return 'live';
  return 'upcoming';
}

function mapEnding(duration: string): 'NT' | 'ET' | 'PENS' | null {
  if (duration === 'PENALTY_SHOOTOUT') return 'PENS';
  if (duration === 'EXTRA_TIME')       return 'ET';
  if (duration === 'REGULAR')          return 'NT';
  return null;
}

Deno.serve(async () => {
  if (!FOOTBALL_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'FOOTBALL_DATA_API_KEY secret not set. See README.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const nowMs = Date.now();

  // Find match IDs whose live window overlaps with right now.
  const inWindowIds = Object.entries(KICKOFFS)
    .filter(([, kickoff]) => {
      const ko = new Date(kickoff).getTime();
      return nowMs >= ko && nowMs < ko + WINDOW_MS;
    })
    .map(([id]) => id);

  if (inWindowIds.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, skipped: true, reason: 'no matches in live window' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check if all in-window matches are already marked final — if so, the games
  // are done and we don't need another API call until the next window opens.
  const { data: notFinal } = await supabase
    .from('match_results')
    .select('match_id')
    .in('match_id', inWindowIds)
    .neq('status', 'final')
    .limit(1);

  // Also treat matches not yet in the DB (never synced) as not-final.
  const { data: existing } = await supabase
    .from('match_results')
    .select('match_id')
    .in('match_id', inWindowIds);

  const existingIds = new Set((existing ?? []).map((r: { match_id: string }) => r.match_id));
  const hasUnsyncedMatch = inWindowIds.some(id => !existingIds.has(id));

  if (!hasUnsyncedMatch && (!notFinal || notFinal.length === 0)) {
    return new Response(
      JSON.stringify({ ok: true, skipped: true, reason: 'all in-window matches already final' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // At least one in-window match is not yet final — fetch from football-data.org.
  const apiRes = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
    headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
  });

  if (!apiRes.ok) {
    return new Response(
      JSON.stringify({ error: `football-data.org API error: ${apiRes.status}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { matches } = await apiRes.json();

  const upserts: Array<{
    match_id: string; status: string;
    home_score: number | null; away_score: number | null;
    live_minute: number | null; ending: string | null;
    home_code: string | null; away_code: string | null;
  }> = [];

  for (const m of matches) {
    const homeTla = m.homeTeam?.tla ?? '';
    const awayTla = m.awayTeam?.tla ?? '';
    const matchId = findMatchId(homeTla, awayTla, m.utcDate ?? '');
    if (!matchId) continue;

    const status  = mapStatus(m.status);
    const score   = m.score ?? {};
    const isLive  = status === 'live';
    const isFinal = status === 'final';

    let homeScore: number | null = null;
    let awayScore: number | null = null;
    let ending: string | null = null;

    if (isLive || isFinal) {
      const duration = score.duration ?? 'REGULAR';
      ending = isFinal ? mapEnding(duration) : null;

      if (score.duration === 'PENALTY_SHOOTOUT' && isFinal) {
        homeScore = score.penalties?.home ?? null;
        awayScore = score.penalties?.away ?? null;
      } else if ((score.duration === 'EXTRA_TIME' || score.duration === 'PENALTY_SHOOTOUT') && isFinal) {
        homeScore = score.extraTime?.home ?? score.fullTime?.home ?? null;
        awayScore = score.extraTime?.away ?? score.fullTime?.away ?? null;
      } else {
        homeScore = score.fullTime?.home ?? null;
        awayScore = score.fullTime?.away ?? null;
      }
    }

    const homeCode = homeTla ? normalise(homeTla) : null;
    const awayCode = awayTla ? normalise(awayTla) : null;

    upserts.push({
      match_id: matchId,
      status,
      home_score: homeScore,
      away_score: awayScore,
      live_minute: isLive ? (m.minute ?? null) : null,
      ending: isFinal ? ending : null,
      home_code: homeCode,
      away_code: awayCode,
    });
  }

  if (upserts.length > 0) {
    const { error } = await supabase
      .from('match_results')
      .upsert(upserts, { onConflict: 'match_id' });
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ ok: true, synced: upserts.length, total: matches.length, activeWindows: inWindowIds }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});
