import { useState, useEffect, useCallback, useMemo } from 'react';
import SchedulePage from './pages/SchedulePage.jsx';
import AwardsPage from './pages/AwardsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import RulesPage from './pages/RulesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import { TopBar, LiveSyncStrip } from './components/index.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { supabase } from './lib/supabase.js';
import { MATCHES, isKnockout } from './lib/data.js';
import {
  loadAllPredictionsFromDB,
  upsertPrediction,
  loadAllAwardPredictionsFromDB,
  upsertAwardPrediction,
} from './lib/predictions.js';

// Merge static MATCHES with live results + bracket team codes from Supabase
function buildEnrichedMatches(matches, results) {
  return matches.map(m => {
    const r = results[m.id];

    // Auto-populate knockout bracket: swap TBD for real team codes from DB
    // once the API knows who qualified (happens after group stage ~June 27)
    let enriched = m;
    if (r) {
      const newHome = r.home_code && r.home_code !== 'TBD' && m.home === 'TBD' ? r.home_code : m.home;
      const newAway = r.away_code && r.away_code !== 'TBD' && m.away === 'TBD' ? r.away_code : m.away;
      if (newHome !== m.home || newAway !== m.away) {
        enriched = { ...m, home: newHome, away: newAway };
      }
    }

    if (!r || r.status === 'upcoming') return enriched;

    const ko   = isKnockout(enriched);
    const home = r.home_score ?? 0;
    const away = r.away_score ?? 0;

    if (r.status === 'final') {
      return {
        ...enriched,
        result: ko ? { score: [home, away], ending: r.ending ?? 'NT' } : [home, away],
        live: null,
      };
    }
    if (r.status === 'live') {
      return {
        ...enriched,
        result: null,
        live: { score: [home, away], minute: r.live_minute ?? 0 },
      };
    }
    return enriched;
  });
}

const ADMIN_IDS = new Set(['u27', 'u20']); // Nathan + Kimzo

function AppShell() {
  const { session, profile, authError, signOut } = useAuth();
  const [view, setView] = useState('schedule');
  const [predictions, setPredictions]           = useState({});
  const [awardPredictions, setAwardPredictions] = useState({});
  const [matchResults, setMatchResults]         = useState({});
  const [awardWinners, setAwardWinners]         = useState({});
  const [lastSync, setLastSync]                 = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [toast, setToast]                       = useState(null);

  const authLoading  = session === undefined;
  const activeUserId = profile?.internal_id ?? null;
  const isAdmin      = ADMIN_IDS.has(activeUserId);

  // Build enriched matches (static fixtures + live results from DB)
  const enrichedMatches = useMemo(
    () => buildEnrichedMatches(MATCHES, matchResults),
    [matchResults]
  );

  // Load predictions + match results on login
  useEffect(() => {
    if (!profile) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      loadAllPredictionsFromDB(supabase),
      loadAllAwardPredictionsFromDB(supabase),
      supabase.from('match_results').select('*'),
      supabase.from('award_winners').select('*'),
    ])
      .then(([preds, awardPreds, { data: results }, { data: winners }]) => {
        setPredictions(preds);
        setAwardPredictions(awardPreds);
        if (results) {
          const map = {};
          results.forEach(r => { map[r.match_id] = r; });
          setMatchResults(map);
          setLastSync(new Date());
        }
        if (winners) {
          const map = {};
          winners.forEach(w => { if (w.winner) map[w.award_id] = w.winner; });
          setAwardWinners(map);
        }
      })
      .catch(() => showToast('Could not load data. Please refresh.'))
      .finally(() => setLoading(false));
  }, [profile]);

  // Call the Vercel sync-scores function, then refresh from Supabase
  const syncScores = useCallback(async () => {
    try {
      await fetch('/api/sync-scores');
    } catch {}
    const { data } = await supabase.from('match_results').select('*');
    if (data) {
      const map = {};
      data.forEach(r => { map[r.match_id] = r; });
      setMatchResults(map);
      setLastSync(new Date());
    }
  }, []);

  // Admin auto-polls every 2 minutes while on the schedule page
  useEffect(() => {
    if (!profile || !isAdmin || view !== 'schedule') return;
    const t = setInterval(syncScores, 2 * 60 * 1000);
    return () => clearInterval(t);
  }, [profile, isAdmin, view, syncScores]);

  // Realtime: match results + award winners push to all clients instantly
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel('live_updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'match_results' },
        (payload) => {
          setMatchResults(prev => ({ ...prev, [payload.new.match_id]: payload.new }));
          setLastSync(new Date());
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'award_winners' },
        (payload) => {
          setAwardWinners(prev => {
            const next = { ...prev };
            if (payload.new.winner) next[payload.new.award_id] = payload.new.winner;
            else delete next[payload.new.award_id];
            return next;
          });
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [profile]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const handlePredict = useCallback(async (matchId, predData) => {
    if (!profile) return;
    const key = `${activeUserId}:${matchId}`;
    setPredictions(prev => ({ ...prev, [key]: predData }));
    try {
      await upsertPrediction(supabase, session.user.id, activeUserId, matchId, predData);
    } catch {
      showToast('Save failed — check your connection.');
    }
  }, [profile, activeUserId, session]);

  const handleAwardPredict = useCallback(async (awardId, predData) => {
    if (!profile) return;
    const key = `${activeUserId}:${awardId}`;
    setAwardPredictions(prev => ({ ...prev, [key]: predData }));
    try {
      await upsertAwardPrediction(supabase, session.user.id, activeUserId, awardId, predData);
    } catch {
      showToast('Save failed — check your connection.');
    }
  }, [profile, activeUserId, session]);

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-ball">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#F5F3EE" stroke="#0E1116" strokeWidth="1" />
            <path d="M12 7.5 L15.5 10 L14.2 14 L9.8 14 L8.5 10 Z" fill="#0E1116" />
          </svg>
        </div>
      </div>
    );
  }

  if (!session) return <LoginPage authError={authError} />;

  if (!profile) {
    return (
      <div className="auth-loading">
        {authError ? (
          <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 24px' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 20 }}>
              {authError}
            </div>
            <button onClick={signOut} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', background: 'none', border: '1px solid var(--line-soft)', padding: '8px 16px', cursor: 'pointer', borderRadius: 2 }}>
              Sign out and try again
            </button>
          </div>
        ) : (
          <div className="auth-loading-text">Setting up your account…</div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <TopBar
        profile={profile}
        onLogout={signOut}
        view={view}
        setView={setView}
        isAdmin={isAdmin}
      />
      <LiveSyncStrip
        matches={enrichedMatches}
        lastSync={lastSync}
        onSync={syncScores}
      />
      <main>
        {loading ? (
          <div className="page-loading">Loading…</div>
        ) : (
          <>
            {view === 'schedule' && (
              <SchedulePage
                activeUserId={activeUserId}
                predictions={predictions}
                onPredict={handlePredict}
                matches={enrichedMatches}
                showToast={showToast}
              />
            )}
            {view === 'awards' && (
              <AwardsPage
                activeUserId={activeUserId}
                awardPredictions={awardPredictions}
                awardWinners={awardWinners}
                onAwardPredict={handleAwardPredict}
              />
            )}
            {view === 'leaderboard' && (
              <LeaderboardPage
                activeUserId={activeUserId}
                predictions={predictions}
                awardPredictions={awardPredictions}
                awardWinners={awardWinners}
                matches={enrichedMatches}
                setView={setView}
              />
            )}
            {view === 'rules' && <RulesPage />}
            {view === 'admin' && isAdmin && (
              <AdminPage matchResults={matchResults} awardWinners={awardWinners} />
            )}
          </>
        )}
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
