// sync-results — Supabase Edge Function
// Fetches live FIFA World Cup 2026 scores from football-data.org
// and writes them to the match_results table.
//
// Deploy:  supabase functions deploy sync-results
// Secret:  supabase secrets set FOOTBALL_DATA_API_KEY=your_key
// Cron:    schedule every 5 min via Supabase Dashboard → Edge Functions → schedule

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FOOTBALL_API_KEY = Deno.env.get('FOOTBALL_DATA_API_KEY') ?? '';
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Map from football-data.org team TLA → our team code (where they differ)
const CODE_MAP: Record<string, string> = {
  'BOS': 'BIH',  // Bosnia & Herzegovina
  'DRC': 'COD',  // DR Congo
  'RSA': 'RSA',  // South Africa (same, but explicit)
  'USA': 'USA',
  'HAI': 'HAI',
  'CUW': 'CUW',
  'CPV': 'CPV',
};

function normalise(tla: string): string {
  return CODE_MAP[tla] ?? tla;
}

// Pre-built lookup: "HOME:AWAY" → our match ID for group stage
// Built from the same GROUP_FIXTURES data as data.js
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
// Used to match knockout fixtures once teams are known
const KO_DATE_LOOKUP: Record<string, string> = {
  '2026-06-28T19:00': 'M73', '2026-06-29T20:30': 'M74', '2026-06-30T01:00': 'M75',
  '2026-06-29T17:00': 'M76', '2026-06-30T21:00': 'M77', '2026-06-30T17:00': 'M78',
  '2026-07-01T02:00': 'M79', '2026-07-01T16:00': 'M80', '2026-07-02T00:00': 'M81',
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
  // Try group stage lookup first
  const key = `${normalise(home)}:${normalise(away)}`;
  if (GROUP_LOOKUP[key]) return GROUP_LOOKUP[key];

  // Try knockout by date (first 16 chars: "YYYY-MM-DDTHH:MM")
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

  // Fetch all WC matches from football-data.org
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
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const upserts: Array<{
    match_id: string; status: string;
    home_score: number | null; away_score: number | null;
    live_minute: number | null; ending: string | null;
  }> = [];

  for (const m of matches) {
    const matchId = findMatchId(
      m.homeTeam?.tla ?? '',
      m.awayTeam?.tla ?? '',
      m.utcDate ?? ''
    );
    if (!matchId) continue;

    const status = mapStatus(m.status);
    const score  = m.score ?? {};
    const isLive = status === 'live';
    const isFinal = status === 'final';

    let homeScore: number | null = null;
    let awayScore: number | null = null;
    let ending: string | null = null;

    if (isLive || isFinal) {
      const duration = score.duration ?? 'REGULAR';
      ending = isFinal ? mapEnding(duration) : null;

      if (score.duration === 'PENALTY_SHOOTOUT' && isFinal) {
        // Use penalty shootout score as the final score
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

    upserts.push({
      match_id: matchId,
      status,
      home_score: homeScore,
      away_score: awayScore,
      live_minute: isLive ? (m.minute ?? null) : null,
      ending: isFinal ? ending : null,
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
    JSON.stringify({ ok: true, synced: upserts.length, total: matches.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});
