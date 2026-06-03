import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase.js';
import { MATCHES, TEAMS, AWARDS, isKnockout, STAGE_LABELS } from '../lib/data.js';
import { fmtDateShort } from '../lib/format.js';
import PlayerAutocomplete from '../components/PlayerAutocomplete.jsx';

// Simple admin panel for manually updating match results.
// Only visible to the admin user (internal_id === 'u27').
// Results written here go straight to Supabase and are instantly
// visible to all 27 participants via Realtime.

function AdminPage({ matchResults, awardWinners = {} }) {
  const [filter, setFilter] = useState('live-upcoming');
  const [saving, setSaving] = useState(null);
  const [saved, setSaved]   = useState(null);

  const matches = useMemo(() => {
    return MATCHES.filter(m => {
      const r = matchResults[m.id];
      const status = r?.status ?? 'upcoming';
      if (filter === 'live-upcoming') return status !== 'final';
      if (filter === 'final')         return status === 'final';
      return true;
    });
  }, [matchResults, filter]);

  const handleSave = async (matchId, data) => {
    setSaving(matchId);
    const { error } = await supabase
      .from('match_results')
      .upsert({ match_id: matchId, ...data }, { onConflict: 'match_id' });
    setSaving(null);
    if (!error) {
      setSaved(matchId);
      setTimeout(() => setSaved(null), 2000);
    } else {
      alert(`Save failed: ${error.message}`);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Admin · Results Panel</div>
          <h1 className="page-title">Update <em>results.</em></h1>
        </div>
        <div className="page-meta">
          <div style={{ color: 'var(--heat)' }}>Admin only · visible to you only</div>
          <div>Changes sync to all 27 players instantly</div>
        </div>
      </div>

      <div className="filters" style={{ marginBottom: 24 }}>
        {[
          ['live-upcoming', 'Live & Upcoming'],
          ['final', 'Completed'],
          ['all', 'All'],
        ].map(([val, label]) => (
          <button
            key={val}
            className={`chip ${filter === val ? 'active' : ''}`}
            onClick={() => setFilter(val)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Award Winners Section */}
      <AwardWinnersPanel awardWinners={awardWinners} />

      <div className="admin-grid">
        {matches.map(m => (
          <AdminMatchCard
            key={m.id}
            match={m}
            result={matchResults[m.id]}
            onSave={handleSave}
            saving={saving === m.id}
            saved={saved === m.id}
          />
        ))}
      </div>
    </>
  );
}

function AdminMatchCard({ match, result, onSave, saving, saved }) {
  const isKO = isKnockout(match);
  const isTBD = match.home === 'TBD' || match.away === 'TBD';
  const current = result ?? { status: 'upcoming', home_score: null, away_score: null, ending: null, live_minute: null };

  const [status,  setStatus]  = useState(current.status);
  const [home,    setHome]    = useState(current.home_score ?? '');
  const [away,    setAway]    = useState(current.away_score ?? '');
  const [ending,  setEnding]  = useState(current.ending ?? 'NT');
  const [minute,  setMinute]  = useState(current.live_minute ?? '');

  const homeTeam = isTBD ? { code: '?', name: match.homeLabel } : TEAMS[match.home];
  const awayTeam = isTBD ? { code: '?', name: match.awayLabel } : TEAMS[match.away];

  const handleSubmit = (e) => {
    e.preventDefault();
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    onSave(match.id, {
      status,
      home_score: isNaN(h) ? null : h,
      away_score: isNaN(a) ? null : a,
      ending: (isKO && status === 'final') ? ending : null,
      live_minute: status === 'live' ? (parseInt(minute, 10) || null) : null,
    });
  };

  const statusColor = status === 'final' ? 'var(--grass)' : status === 'live' ? 'var(--heat)' : 'var(--ink-3)';

  return (
    <form className="admin-card" onSubmit={handleSubmit}>
      <div className="admin-card-head">
        <span className="admin-match-id">{match.id}</span>
        <span className="admin-teams">
          {homeTeam.code} <span style={{ opacity: 0.4 }}>v</span> {awayTeam.code}
        </span>
        {isKO && <span className="badge-group ko">{STAGE_LABELS[match.stage] || match.stage}</span>}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
          {fmtDateShort(match.date)}
        </span>
      </div>

      <div className="admin-card-body">
        {/* Status */}
        <div className="admin-field">
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ borderColor: statusColor }}>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="final">Final</option>
          </select>
        </div>

        {/* Score */}
        {status !== 'upcoming' && (
          <div className="admin-field">
            <label>{isKO && ending === 'PENS' ? 'Shootout score' : 'Score'}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number" min="0" max="20"
                value={home} onChange={e => setHome(e.target.value)}
                placeholder="0" className="admin-score-input"
              />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>–</span>
              <input
                type="number" min="0" max="20"
                value={away} onChange={e => setAway(e.target.value)}
                placeholder="0" className="admin-score-input"
              />
            </div>
          </div>
        )}

        {/* Live minute */}
        {status === 'live' && (
          <div className="admin-field">
            <label>Minute</label>
            <input
              type="number" min="1" max="120"
              value={minute} onChange={e => setMinute(e.target.value)}
              placeholder="45" className="admin-score-input"
            />
          </div>
        )}

        {/* Knockout ending */}
        {isKO && status === 'final' && (
          <div className="admin-field">
            <label>Ended in</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['NT', 'ET', 'PENS'].map(opt => (
                <button
                  key={opt} type="button"
                  className={`ko-radio ${ending === opt ? 'active' : ''}`}
                  onClick={() => setEnding(opt)}
                  style={{ fontSize: 12 }}
                >
                  {opt === 'NT' ? 'Normal' : opt === 'ET' ? 'Extra Time' : 'Penalties'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="admin-card-foot">
        <button type="submit" className="submit-btn" disabled={saving}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save →'}
        </button>
      </div>
    </form>
  );
}

function AwardWinnersPanel({ awardWinners }) {
  const [drafts,  setDrafts]  = useState({});
  const [saving,  setSaving]  = useState(null);
  const [saved,   setSaved]   = useState(null);

  const handleSave = async (awardId, value) => {
    setSaving(awardId);
    const { error } = await supabase
      .from('award_winners')
      .upsert({ award_id: awardId, winner: value || null }, { onConflict: 'award_id' });
    setSaving(null);
    if (!error) {
      setSaved(awardId);
      setTimeout(() => setSaved(null), 2000);
      setDrafts(d => { const c = { ...d }; delete c[awardId]; return c; });
    } else {
      alert(`Save failed: ${error.message}`);
    }
  };

  return (
    <div className="admin-winners-panel">
      <div className="admin-winners-head">
        <span className="admin-winners-title">Official Award Winners</span>
        <span className="admin-winners-sub">Set after FIFA announces each winner — updates all participants instantly</span>
      </div>
      <div className="admin-winners-grid">
        {AWARDS.map(a => {
          const current = awardWinners[a.id] ?? '';
          const draft = drafts[a.id] ?? current;
          return (
            <div key={a.id} className="admin-winner-card">
              <div className="admin-winner-label">{a.name}</div>
              <div className="admin-winner-sub">{a.subtitle}</div>
              <div className="admin-winner-row">
                <PlayerAutocomplete
                  inputType={a.inputType === 'team' ? 'team' : 'player'}
                  value={draft}
                  onChange={(v) => setDrafts(d => ({ ...d, [a.id]: v }))}
                  placeholder={`Enter ${a.inputType === 'team' ? 'team' : 'player'} name…`}
                />
                <button
                  type="button"
                  className="submit-btn"
                  disabled={saving === a.id || draft === current}
                  onClick={() => handleSave(a.id, draft)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {saving === a.id ? 'Saving…' : saved === a.id ? '✓ Saved' : 'Set Winner →'}
                </button>
              </div>
              {current && (
                <div className="admin-winner-current">
                  Current: <strong>{current}</strong>
                  <button
                    type="button"
                    className="admin-winner-clear"
                    onClick={() => { setDrafts(d => ({ ...d, [a.id]: '' })); handleSave(a.id, ''); }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminPage;
