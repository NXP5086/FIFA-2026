import { createClient } from '@supabase/supabase-js';

// api-football.com team name → our internal team code
// Using names because the API's team.code field is unreliable across seasons
const NAME_MAP = {
  'Mexico': 'MEX', 'Canada': 'CAN', 'United States': 'USA', 'Argentina': 'ARG',
  'Brazil': 'BRA', 'France': 'FRA', 'England': 'ENG', 'Spain': 'ESP',
  'Germany': 'GER', 'Portugal': 'POR', 'Netherlands': 'NED', 'Belgium': 'BEL',
  'Croatia': 'CRO', 'Uruguay': 'URU', 'Japan': 'JPN', 'South Korea': 'KOR',
  'Korea Republic': 'KOR', 'Republic of Korea': 'KOR', 'Australia': 'AUS',
  'Morocco': 'MAR', 'Senegal': 'SEN', 'Egypt': 'EGY', 'Ghana': 'GHA',
  "Ivory Coast": 'CIV', "Cote d'Ivoire": 'CIV', "Côte d'Ivoire": 'CIV',
  'Iran': 'IRN', 'IR Iran': 'IRN', 'Saudi Arabia': 'SAU', 'Qatar': 'QAT',
  'Switzerland': 'SUI', 'Ecuador': 'ECU', 'Colombia': 'COL', 'New Zealand': 'NZL',
  'Norway': 'NOR', 'Tunisia': 'TUN', 'South Africa': 'RSA', 'Czechia': 'CZE',
  'Czech Republic': 'CZE', 'Bosnia': 'BIH', 'Bosnia and Herzegovina': 'BIH',
  'Bosnia & Herzegovina': 'BIH', 'Scotland': 'SCO', 'Haiti': 'HAI',
  'Paraguay': 'PAR', 'Turkey': 'TUR', 'Turkiye': 'TUR', 'Türkiye': 'TUR',
  'Curacao': 'CUW', 'Curaçao': 'CUW', 'Sweden': 'SWE', 'Cape Verde': 'CPV',
  'Iraq': 'IRQ', 'Austria': 'AUT', 'Algeria': 'ALG', 'Jordan': 'JOR',
  'Uzbekistan': 'UZB', 'DR Congo': 'COD', 'Congo DR': 'COD',
  'Democratic Republic of Congo': 'COD', 'Panama': 'PAN',
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

// api-football.com status short codes
const LIVE_STATUS   = new Set(['1H', '2H', 'HT', 'ET', 'BT', 'P', 'INT', 'LIVE']);
const FINISH_STATUS = new Set(['FT', 'AET', 'PEN']);
// Map API finish status → our ending code
const ENDING_MAP = { FT: 'NT', AET: 'ET', PEN: 'PENS' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const debug = req.query?.debug === '1';

  const apiKey          = process.env.API_FOOTBALL_KEY;
  const supabaseUrl     = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseService = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !supabaseService) {
    return res.status(500).json({ error: 'Missing env vars: API_FOOTBALL_KEY, SUPABASE_URL/VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY' });
  }

  const supabase = createClient(supabaseUrl, supabaseService);

  const BASE = 'https://v3.football.api-sports.io';
  const headers = { 'x-apisports-key': apiKey };

  // Fetch yesterday + today to catch late-night matches in all timezones
  const now  = new Date();
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  const fmt = d => d.toISOString().split('T')[0];

  // Fetch today's WC matches (league 1 = FIFA World Cup, season 2026)
  // and yesterday's in case of overnight games still in progress
  const urls = [
    `${BASE}/fixtures?league=1&season=2026&date=${fmt(now)}`,
    `${BASE}/fixtures?league=1&season=2026&date=${fmt(yesterday)}`,
  ];

  let allFixtures = [];
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers });
      if (r.ok) {
        const data = await r.json();
        allFixtures = allFixtures.concat(data.response || []);
      }
    } catch {}
  }

  // Debug: also fetch today without league filter + search for WC league
  if (debug) {
    const fmt2 = d => d.toISOString().split('T')[0];
    const [leagueRes, todayRes] = await Promise.all([
      fetch(`${BASE}/leagues?name=World Cup&season=2026`, { headers }).then(r => r.json()).catch(e => ({ error: e.message })),
      fetch(`${BASE}/fixtures?date=${fmt2(now)}`, { headers }).then(r => r.json()).catch(e => ({ error: e.message })),
    ]);
    return res.status(200).json({
      // What the league search returned (shows correct league ID)
      wc_league_search: leagueRes?.response?.map(l => ({ id: l.league?.id, name: l.league?.name, season: l.seasons?.at(-1)?.year })),
      // All fixtures today across all leagues — look for MEX/RSA here
      today_all_leagues: {
        total: todayRes?.response?.length ?? 0,
        wc_only: todayRes?.response
          ?.filter(f => f.league?.name?.toLowerCase().includes('world'))
          ?.map(f => ({ leagueId: f.league?.id, leagueName: f.league?.name, home: f.teams?.home?.name, away: f.teams?.away?.name, status: f.fixture?.status?.short })),
      },
      // Original league=1 result
      league1_fixtures: allFixtures.map(f => ({
        date: f.fixture?.date, status: f.fixture?.status?.short,
        homeName: f.teams?.home?.name, awayName: f.teams?.away?.name,
        goals: f.goals,
      })),
    });
  }

  const upserts = [];
  const skipped = [];

  for (const f of allFixtures) {
    const statusShort = f.fixture?.status?.short;

    if (!LIVE_STATUS.has(statusShort) && !FINISH_STATUS.has(statusShort)) continue;

    // Map team names → our internal codes
    const homeCode = NAME_MAP[f.teams?.home?.name];
    const awayCode = NAME_MAP[f.teams?.away?.name];
    if (!homeCode || !awayCode) {
      skipped.push({ reason: 'unknown team name', home: f.teams?.home?.name, away: f.teams?.away?.name });
      continue;
    }

    const matchId = resolveMatchId(homeCode, awayCode, f.fixture?.date);
    if (!matchId) {
      skipped.push({ reason: 'no match id', home: homeCode, away: awayCode });
      continue;
    }

    const isKO     = matchId.startsWith('M');
    const liveHome = f.goals?.home ?? 0;
    const liveAway = f.goals?.away ?? 0;

    const row = { match_id: matchId };

    if (FINISH_STATUS.has(statusShort)) {
      const ending = ENDING_MAP[statusShort] || 'NT';
      // For penalty shootouts, store the shootout score (not the match score)
      const finalHome = statusShort === 'PEN'
        ? (f.score?.penalty?.home ?? liveHome)
        : (f.score?.fulltime?.home ?? liveHome);
      const finalAway = statusShort === 'PEN'
        ? (f.score?.penalty?.away ?? liveAway)
        : (f.score?.fulltime?.away ?? liveAway);

      row.status      = 'final';
      row.home_score  = finalHome;
      row.away_score  = finalAway;
      row.live_minute = null;
      if (isKO) row.ending = ending;
    } else {
      // Live match
      row.status      = 'live';
      row.home_score  = liveHome;
      row.away_score  = liveAway;
      row.live_minute = f.fixture?.status?.elapsed ?? null;
    }

    // KO matches: store team codes so bracket populates once known
    if (isKO) {
      row.home_code = homeCode;
      row.away_code = awayCode;
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
