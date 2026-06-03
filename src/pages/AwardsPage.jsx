import { useState, useEffect, useMemo } from 'react';
import {
  AWARDS,
  LOCK_WINDOWS,
  scoreAwardPrediction,
  isAwardsLocked,
} from '../lib/data.js';
import { fmtLock } from '../lib/format.js';
import PlayerAutocomplete from '../components/PlayerAutocomplete.jsx';

function AwardsPage({ activeUserId, awardPredictions, awardWinners = {}, onAwardPredict }) {
  const [drafts, setDrafts] = useState({});
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const awardsLocked = isAwardsLocked ? isAwardsLocked(nowMs) : false;
  const awardsLockAt = LOCK_WINDOWS ? LOCK_WINDOWS.AWARDS : null;

  // Pull this user's existing submitted picks into a usable map
  const myPicks = useMemo(() => {
    const out = {};
    AWARDS.forEach(a => {
      const k = `${activeUserId}:${a.id}`;
      if (awardPredictions[k]) out[a.id] = awardPredictions[k];
    });
    return out;
  }, [awardPredictions, activeUserId]);

  // How many awards predicted / submitted
  const stats = useMemo(() => {
    let submitted = 0, scored = 0, points = 0, settled = 0;
    AWARDS.forEach(a => {
      const winner = awardWinners[a.id];
      if (winner) settled++;
      const pick = myPicks[a.id];
      if (pick && pick.submitted) {
        submitted++;
        if (winner) {
          const pts = scoreAwardPrediction(pick.pick, winner);
          if (pts > 0) { scored++; points += pts; }
        }
      }
    });
    return { submitted, scored, points, settled };
  }, [myPicks, awardWinners]);

  const handleDraftChange = (awardId, value) => {
    setDrafts(d => ({ ...d, [awardId]: value }));
  };

  const handleSubmit = (awardId) => {
    const value = (drafts[awardId] ?? "").trim();
    if (!value) return;
    onAwardPredict(awardId, { pick: value, submitted: true });
    setDrafts(d => { const c = { ...d }; delete c[awardId]; return c; });
  };

  const handleEdit = (awardId) => {
    const existing = myPicks[awardId];
    setDrafts(d => ({ ...d, [awardId]: existing?.pick || "" }));
    onAwardPredict(awardId, { ...(existing || {}), submitted: false });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Tournament Awards · Bonus Picks</div>
          <h1 className="page-title">Call the <em>winners.</em></h1>
        </div>
        <div className="page-meta">
          <div><strong>{stats.submitted}/{AWARDS.length}</strong> picks submitted</div>
          <div><strong>{stats.settled}</strong> of {AWARDS.length} awarded</div>
          <div style={{ color: "var(--grass-deep)" }}>+5 pts each when called right</div>
        </div>
      </div>

      <div className={`awards-intro ${awardsLocked ? "locked" : ""}`}>
        <div className="awards-intro-num">{awardsLocked ? "🔒" : "+5"}</div>
        <div className="awards-intro-text">
          {awardsLocked ? (
            <>
              <strong>Award picks are closed.</strong> Predictions locked 2 hours before the first
              semi-final kicked off. Your submitted picks below are final and will be scored when
              FIFA announces each winner.
            </>
          ) : (
            <>
              <strong>Five points per correct award.</strong> Type the player or team name exactly as
              FIFA announces it. Picks <strong>auto-lock {fmtLock ? fmtLock(awardsLockAt) : ""}</strong>
              {" "}— 2 hours before the first semi-final. Edit anytime until then.
            </>
          )}
        </div>
      </div>

      <div className="awards-grid">
        {AWARDS.map((award, idx) => {
          const pick = myPicks[award.id];
          const winner = awardWinners[award.id] ?? null;
          const settled = !!winner;
          const draft = drafts[award.id];
          const isEditing = draft !== undefined || !pick;
          const correct = pick && settled && pick.submitted
            && scoreAwardPrediction(pick.pick, winner) > 0;
          const wrong = pick && settled && pick.submitted && !correct;

          return (
            <div
              key={award.id}
              className={`award-card ${settled ? "settled" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
            >
              <div className="award-head">
                <div className="award-num">{String(idx + 1).padStart(2, "0")}</div>
                <div className="award-titles">
                  <div className="award-name">{award.name}</div>
                  <div className="award-sub">{award.subtitle}</div>
                </div>
                <div className="award-pts">
                  {correct
                    ? <span className="pts-pill earned">+5 PTS</span>
                    : wrong
                    ? <span className="pts-pill missed">+0 PTS</span>
                    : <span className="pts-pill open">+5 PTS</span>}
                </div>
              </div>

              <div className="award-body">
                {settled && (
                  <div className="award-official">
                    <div className="award-official-label">Official Winner</div>
                    <div className="award-official-name">{winner}</div>
                  </div>
                )}

                {pick && pick.submitted && !isEditing ? (
                  <div className="award-pick locked">
                    <div className="award-pick-label">Your Pick</div>
                    <div className="award-pick-name">{pick.pick}</div>
                    {!settled && !awardsLocked && (
                      <button
                        className="award-edit-btn"
                        onClick={() => handleEdit(award.id)}
                        type="button"
                      >
                        Edit
                      </button>
                    )}
                    {!settled && awardsLocked && (
                      <span className="award-locked-tag">🔒 Locked</span>
                    )}
                  </div>
                ) : awardsLocked && !settled ? (
                  <div className="award-pick locked closed">
                    <div className="award-pick-label">Your Pick</div>
                    <div className="award-pick-name muted">No pick submitted — picks closed</div>
                    <span className="award-locked-tag">🔒 Locked</span>
                  </div>
                ) : (
                  <div className="award-input-row">
                    <div className="award-input-wrap">
                      <label className="award-input-label">Your Pick</label>
                      <PlayerAutocomplete
                        inputType={award.inputType === 'team' ? 'team' : 'player'}
                        value={draft ?? pick?.pick ?? ""}
                        onChange={(v) => handleDraftChange(award.id, v)}
                        disabled={settled || awardsLocked}
                        placeholder={award.hint}
                      />
                    </div>
                    <button
                      type="button"
                      className="submit-btn"
                      disabled={settled || awardsLocked || !(drafts[award.id] ?? "").trim()}
                      onClick={() => handleSubmit(award.id)}
                    >
                      {pick ? "Update →" : "Submit →"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default AwardsPage;
