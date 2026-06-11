import { createClient } from '@supabase/supabase-js';

// football-data.org TLA → our internal team code
// Most match exactly; this covers known/possible divergences.
const TLA_MAP = {
  MEX: 'MEX', CAN: 'CAN', USA: 'USA', ARG: 'ARG', BRA: 'BRA',
  FRA: 'FRA', ENG: 'ENG', ESP: 'ESP', GER: 'GER', POR: 'POR',
  NED: 'NED', BEL: 'BEL', CRO: 'CRO', URU: 'URU', JPN: 'JPN',
  KOR: 'KOR', AUS: 'AUS', MAR: 'MAR', SEN: 'SEN', EGY: 'EGY',
  GHA: 'GHA', CIV: 'CIV', IRN: 'IRN', SAU: 'SAU', QAT: 'QAT',
  SUI: 'SUI', ECU: 'ECU', COL: 'COL', NZL: 'NZL', NOR: 'NOR',
  TUN: 'TUN', RSA: 'RSA', CZE: 'CZE', BIH: 'BIH', SCO: 'SCO',
  HAI: 'HAI', PAR: 'PAR', TUR: 'TUR', CUW: 'CUW', SWE: 'SWE',
  CPV: 'CPV', IRQ: 'IRQ', AUT: 'AUT', ALG: 'ALG', JOR: 'JOR',
  UZB: 'UZB', COD: 'COD', PAN: 'PAN',
  // Possible alternative TLAs football-data.org might use
  IRI: 'IRN',  // Iran (Islamic Republic)
  DRC: 'COD',  // DR Congo
  HTI: 'HAI',  // Haiti
  CUR: 'CUW',  // Curaçao
  CDI: 'CIV',  // Côte d'Ivoire
  BOH: 'BIH',  // Bosnia & Herzegovina
  KVX: 'KOR',  // shouldn't appear but safety net
};

// group-stage match index: "HOME-AWAY" → our internal match ID
// Order matches genMatches() in data.js (GROUP_FIXTURES array index + 1)
const GROUP_INDEX = {
  // Group A
  'MEX-RSA': 'G01', 'KOR-CZE': 'G02', 'CZE-RSA': 'G03', 'MEX-KOR': 'G04', 'CZE-MEX': 'G05', 'RSA-KOR': 'G06',
  // Group B
  'CAN-BIH': 'G07', 'QAT-SUI': 'G08', 'SUI-BIH': 'G09', 'CAN-QAT': 'G10', 'SUI-CAN': 'G11', 'BIH-QAT': 'G12',
  // Group C
  'BRA-MAR': 'G13', 'HAI-SCO': 'G14', 'SCO-MAR': 'G15', 'BRA-HAI': 'G16', 'SCO-BRA': 'G17', 'MAR-HAI': 'G18',
  // Group D
  'USA-PAR': 'G19', 'AUS-TUR': 'G20', 'USA-AUS': 'G21', 'TUR-PAR': 'G22', 'TUR-USA': 'G23', 'PAR-AUS': 'G24',
  // Group E
  'GER-CUW': 'G25', 'CIV-ECU': 'G26', 'GER-CIV': 'G27', 'ECU-CUW': 'G28', 'ECU-GER': 'G29', 'CUW-CIV': 'G30',
  // Group F
  'NED-JPN': 'G31', 'SWE-TUN': 'G32', 'NED-SWE': 'G33', 'TUN-JPN': 'G34', 'JPN-SWE': 'G35', 'TUN-NED': 'G36',
  // Group G
  'BEL-EGY': 'G37', 'IRN-NZL': 'G38', 'BEL-IRN': 'G39', 'NZL-EGY': 'G40', 'EGY-IRN': 'G41', 'NZL-BEL': 'G42',
  // Group H
  'ESP-CPV': 'G43', 'SAU-URU': 'G44', 'ESP-SAU': 'G45', 'URU-CPV': 'G46', 'CPV-SAU': 'G47', 'URU-ESP': 'G48',
  // Group I
  'FRA-SEN': 'G49', 'IRQ-NOR': 'G50', 'FRA-IRQ': 'G51', 'NOR-SEN': 'G52', 'NOR-FRA': 'G53', 'SEN-IRQ': 'G54',
  // Group J
  'ARG-ALG': 'G55', 'AUT-JOR': 'G56', 'ARG-AUT': 'G57', 'JOR-ALG': 'G58', 'ALG-AUT': 'G59', 'JOR-ARG': 'G60',
  // Group K
  'POR-COD': 'G61', 'UZB-COL': 'G62', 'POR-UZB': 'G63', 'COL-COD': 'G64', 'COL-POR': 'G65', 'COD-UZB': 'G66',
  // Group L
  'ENG-CRO': 'G67', 'GHA-PAN': 'G68', 'ENG-GHA': 'G69', 'PAN-CRO': 'G70', 'PAN-ENG': 'G71', 'CRO-GHA': 'G72',
};

// KO match index: kickoff UTC time (minutes-since-epoch) → match ID
// Same et() formula as data.js: EDT (UTC-4) → UTC
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

function resolveMatchId(homeTla, awayTla, utcDate) {
  const key = `${homeTla}-${awayTla}`;
  if (GROUP_INDEX[key]) return GROUP_INDEX[key];
  // KO: match by kickoff minute (±5 min tolerance for API rounding)
  const kickoffMs = new Date(utcDate).getTime();
  for (const [ms, id] of KO_BY_MIN) {
    if (Math.abs(kickoffMs - ms) <= 5 * 60 * 1000) return id;
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey          = process.env.FOOTBALL_DATA_API_KEY;
  const supabaseUrl     = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseService = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !supabaseService) {
    return res.status(500).json({ error: 'Missing env vars: FOOTBALL_DATA_API_KEY, SUPABASE_URL/VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY' });
  }

  const supabase = createClient(supabaseUrl, supabaseService);

  // Fetch yesterday → tomorrow to handle all timezones & late-night games
  const now  = new Date();
  const from = new Date(now); from.setDate(from.getDate() - 1);
  const to   = new Date(now); to.setDate(to.getDate() + 1);
  const fmt  = d => d.toISOString().split('T')[0];

  let fdData;
  try {
    const fdRes = await fetch(
      `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${fmt(from)}&dateTo=${fmt(to)}`,
      { headers: { 'X-Auth-Token': apiKey } }
    );
    if (!fdRes.ok) {
      const text = await fdRes.text();
      return res.status(502).json({ error: `football-data.org ${fdRes.status}`, detail: text });
    }
    fdData = await fdRes.json();
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach football-data.org', detail: err.message });
  }

  const upserts = [];
  const skipped = [];

  for (const m of (fdData.matches || [])) {
    const { status, score, minute, homeTeam, awayTeam, utcDate } = m;

    // Only process matches that have started
    if (!['IN_PLAY', 'PAUSED', 'HALF_TIME', 'FINISHED', 'SUSPENDED'].includes(status)) continue;

    const homeTla = TLA_MAP[homeTeam?.tla] || homeTeam?.tla;
    const awayTla = TLA_MAP[awayTeam?.tla] || awayTeam?.tla;
    if (!homeTla || !awayTla) { skipped.push({ reason: 'no tla', utcDate }); continue; }

    const matchId = resolveMatchId(homeTla, awayTla, utcDate);
    if (!matchId) { skipped.push({ reason: 'no match id', home: homeTla, away: awayTla }); continue; }

    const isKO = matchId.startsWith('M');
    const fullHome = score?.fullTime?.home;
    const fullAway = score?.fullTime?.away;
    // During the game fullTime is null — use currentScore or halftime
    const currentHome = fullHome ?? score?.halfTime?.home ?? 0;
    const currentAway = fullAway ?? score?.halfTime?.away ?? 0;

    const row = { match_id: matchId };

    if (status === 'FINISHED') {
      row.status     = 'final';
      row.home_score = fullHome;
      row.away_score = fullAway;
      row.live_minute = null;
      // KO ending: football-data.org doesn't expose NT/ET/PENS in the free tier,
      // so we default to NT and let admin correct if needed.
      if (isKO) row.ending = 'NT';
    } else {
      // IN_PLAY, PAUSED, HALF_TIME, SUSPENDED → treat as live
      row.status     = 'live';
      row.home_score = currentHome;
      row.away_score = currentAway;
      row.live_minute = minute ?? (status === 'HALF_TIME' || status === 'PAUSED' ? 45 : null);
    }

    // For KO matches: capture team codes once known so the bracket populates
    if (isKO && homeTla !== 'TBD' && awayTla !== 'TBD') {
      row.home_code = homeTla;
      row.away_code = awayTla;
    }

    upserts.push(row);
  }

  if (upserts.length === 0) {
    return res.status(200).json({ updated: 0, skipped, message: 'No active matches right now' });
  }

  const { error } = await supabase
    .from('match_results')
    .upsert(upserts, { onConflict: 'match_id' });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({
    updated: upserts.length,
    matches: upserts.map(u => `${u.match_id} (${u.status})`),
    skipped,
  });
}
