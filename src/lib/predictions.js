import { lockKeyForMatch, MATCHES } from './data.js';

// =============================================================
// Supabase helpers — called from App.jsx
// =============================================================

// Load ALL match predictions from DB (all users, submitted + drafts).
// Returns the same map format the app uses: { 'u1:G01': {home,away,...} }
export async function loadAllPredictionsFromDB(supabase) {
  const { data, error } = await supabase
    .from('predictions')
    .select('internal_user_id, match_id, home, away, ending, submitted, submitted_at');
  if (error) throw error;
  const map = {};
  (data || []).forEach(r => {
    map[`${r.internal_user_id}:${r.match_id}`] = {
      home: r.home,
      away: r.away,
      ending: r.ending,
      submitted: r.submitted,
      submitted_at: r.submitted_at,
    };
  });
  return map;
}

// Upsert a single match prediction for the current user.
export async function upsertPrediction(supabase, userId, internalUserId, matchId, predData) {
  const match = MATCHES.find(m => m.id === matchId);
  const roundKey = match ? lockKeyForMatch(match) : 'MD1';
  const row = {
    user_id: userId,
    internal_user_id: internalUserId,
    match_id: matchId,
    round_key: roundKey,
    home: predData.home,
    away: predData.away,
    ending: predData.ending || null,
    submitted: predData.submitted || false,
    submitted_at: predData.submitted ? (predData.submitted_at || new Date().toISOString()) : null,
  };
  console.log('[upsertPrediction] row:', row);
  const { error } = await supabase
    .from('predictions')
    .upsert(row, { onConflict: 'user_id,match_id' });
  console.log('[upsertPrediction] result:', error ?? 'ok');
  if (error) throw error;
}

// Load ALL award predictions from DB.
// Returns map: { 'u1:golden_ball': {pick,submitted,...} }
export async function loadAllAwardPredictionsFromDB(supabase) {
  const { data, error } = await supabase
    .from('award_predictions')
    .select('internal_user_id, award_id, pick, submitted, submitted_at');
  if (error) throw error;
  const map = {};
  (data || []).forEach(r => {
    map[`${r.internal_user_id}:${r.award_id}`] = {
      pick: r.pick,
      submitted: r.submitted,
      submitted_at: r.submitted_at,
    };
  });
  return map;
}

// Upsert a single award prediction for the current user.
export async function upsertAwardPrediction(supabase, userId, internalUserId, awardId, predData) {
  const row = {
    user_id: userId,
    internal_user_id: internalUserId,
    award_id: awardId,
    pick: predData.pick,
    submitted: predData.submitted || false,
    submitted_at: predData.submitted ? (predData.submitted_at || new Date().toISOString()) : null,
  };
  const { error } = await supabase
    .from('award_predictions')
    .upsert(row, { onConflict: 'user_id,award_id' });
  if (error) throw error;
}
