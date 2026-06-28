import { useState, useEffect, useMemo } from 'react';
import {
  USERS,
  TEAMS,
  MATCHES,
  AWARDS,
  isKnockout,
  STAGE_LABELS,
  LOCK_WINDOWS,
  scorePrediction,
  scoreKnockoutPrediction,
  scoreAwardPrediction,
} from '../lib/data.js';
import { fmtDateShort, fmtLock } from '../lib/format.js';


// Round definitions for the reveal — each maps to a lock window key.
function buildRounds(MATCHES) {
  const groupMatches = (pred) => MATCHES.filter(pred);
  return [
    { key: "MD1",  label: "Matchday 1",          lockKey: "MD1",  kind: "matches",
      matches: groupMatches(m => m.stage === "GROUP" && m.matchday === 1) },
    { key: "MD23", label: "Matchday 2 & 3",      lockKey: "MD23", kind: "matches",
      matches: groupMatches(m => m.stage === "GROUP" && (m.matchday === 2 || m.matchday === 3)) },
    { key: "R32",  label: "Round of 32",         lockKey: "R32",  kind: "matches",
      matches: groupMatches(m => m.stage === "R32") },
    { key: "R16",  label: "Round of 16",         lockKey: "R16",  kind: "matches",
      matches: groupMatches(m => m.stage === "R16") },
    { key: "QF",   label: "Quarter-finals",      lockKey: "QF",   kind: "matches",
      matches: groupMatches(m => m.stage === "QF") },
    { key: "SF",   label: "Semi-finals",         lockKey: "SF",   kind: "matches",
      matches: groupMatches(m => m.stage === "SF") },
    { key: "F3RD", label: "Third Place & Final", lockKey: "F3RD", kind: "matches",
      matches: groupMatches(m => m.stage === "3RD" || m.stage === "F") },
    { key: "AWARDS", label: "Awards",            lockKey: "AWARDS", kind: "awards", matches: [] }
  ];
}

// Format a single user's match prediction into a compact cell string
function fmtPick(pred, match) {
  if (!pred || !pred.submitted || pred.home == null || pred.away == null) return null;
  const isKO = isKnockout(match);
  let s = `${pred.home}–${pred.away}`;
  if (isKO && pred.ending) {
    const tag = pred.ending === "PENS" ? "P" : pred.ending === "ET" ? "ET" : "FT";
    s += `\u2009${tag}`;
  }
  return s;
}

function PickReveal({ predictions, awardPredictions, awardWinners = {}, activeUserId, matches: MATCHES }) {
  const [round, setRound] = useState("MD1");
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const rounds = useMemo(() => buildRounds(MATCHES), [MATCHES]);
  const active = rounds.find(r => r.key === round) || rounds[0];

  const lockAt = LOCK_WINDOWS ? LOCK_WINDOWS[active.lockKey] : null;
  const revealed = lockAt != null && nowMs >= lockAt;

  const awardPreds = awardPredictions || {};

  // How many players have locked in at least one pick for this round
  const lockedInCount = useMemo(() => {
    const ids = new Set();
    if (active.kind === "awards") {
      AWARDS.forEach(a => {
        USERS.forEach(u => {
          const p = awardPreds[`${u.id}:${a.id}`];
          if (p && p.submitted) ids.add(u.id);
        });
      });
    } else {
      active.matches.forEach(m => {
        USERS.forEach(u => {
          const p = predictions[`${u.id}:${m.id}`];
          if (p && p.submitted) ids.add(u.id);
        });
      });
    }
    return ids.size;
  }, [active, predictions, awardPreds]);

  return (
    <section className="reveal-section">
      <div className="reveal-head">
        <div>
          <div className="reveal-eyebrow">Pick Reveal · Everyone's Predictions</div>
          <h2 className="reveal-title">Who called what.</h2>
        </div>
        <div className="reveal-note">
          Each round unlocks here the moment its picks auto-lock.
        </div>
      </div>

      {/* Round filter */}
      <div className="reveal-tabs">
        {rounds.map(r => {
          const rLock = LOCK_WINDOWS ? LOCK_WINDOWS[r.lockKey] : null;
          const rRevealed = rLock != null && nowMs >= rLock;
          return (
            <button
              key={r.key}
              className={`reveal-tab ${round === r.key ? "active" : ""}`}
              onClick={() => setRound(r.key)}
            >
              <span className="reveal-tab-lock">{rRevealed ? "🔓" : "🔒"}</span>
              {r.label}
            </button>
          );
        })}
      </div>

      {!revealed ? (
        <div className="reveal-locked">
          <div className="reveal-locked-icon">🔒</div>
          <div className="reveal-locked-title">{active.label} picks are still hidden</div>
          <div className="reveal-locked-sub">
            Predictions reveal when this round locks
            {lockAt != null && <> — <strong>{fmtLock(lockAt)}</strong></>}.
            Until then, picks stay private so nobody can copy.
          </div>
          <div className="reveal-locked-progress">
            <span className="reveal-locked-count">{lockedInCount}</span>
            <span className="reveal-locked-label">of {USERS.length} players have locked in picks</span>
          </div>
        </div>
      ) : active.kind === "awards" ? (
        <AwardsReveal awardPreds={awardPredictions || {}} awardWinners={awardWinners} activeUserId={activeUserId} />
      ) : (
        <MatchesReveal matches={active.matches} predictions={predictions} activeUserId={activeUserId} />
      )}
    </section>
  );
}

// Derive the "winner (score)" label for a user's pick, e.g. MEX (2-0)
function pickLabel(pred, match) {
  if (!pred || !pred.submitted || pred.home == null || pred.away == null) return null;
  const home = match.home === "TBD" ? { code: "TBD" } : TEAMS[match.home];
  const away = match.away === "TBD" ? { code: "TBD" } : TEAMS[match.away];
  let winner, isDraw = false;
  if (pred.home > pred.away) winner = home.code;
  else if (pred.away > pred.home) winner = away.code;
  else { winner = "DRAW"; isDraw = true; }
  let score = `${pred.home}-${pred.away}`;
  if (isKnockout(match) && pred.ending) {
    if (pred.ending === "PENS") score += " P";
    else if (pred.ending === "ET") score += " ET";
    else score += " FT";
  }
  return { winner, score, isDraw };
}

// ---------- matches grid (participants × matches, 3 matches per page) ----------
function MatchesReveal({ matches, predictions, activeUserId }) {
  const PER_PAGE = 3;
  const [page, setPage] = useState(0);

  // Order of play
  const ordered = useMemo(
    () => [...matches].sort((a, b) => a.date.localeCompare(b.date)),
    [matches]
  );

  const pageCount = Math.max(1, Math.ceil(ordered.length / PER_PAGE));
  // Clamp page when the round (and match count) changes
  useEffect(() => { setPage(0); }, [matches]);
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PER_PAGE;
  const pageMatches = ordered.slice(start, start + PER_PAGE);

  if (!ordered.length) return <div className="reveal-empty">No fixtures in this round.</div>;

  return (
    <div className="reveal-grid-wrap">
      <div className="reveal-pager">
        <button
          className="reveal-pager-btn"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={safePage === 0}
        >‹ Prev</button>
        <span className="reveal-pager-label">
          Matches {start + 1}–{Math.min(start + PER_PAGE, ordered.length)} of {ordered.length}
          <span className="reveal-pager-page">Page {safePage + 1} / {pageCount}</span>
        </span>
        <button
          className="reveal-pager-btn"
          onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
          disabled={safePage >= pageCount - 1}
        >Next ›</button>
      </div>

      <table className="reveal-grid">
        <thead>
          <tr>
            <th className="rg-corner">Participant</th>
            {pageMatches.map(m => {
              const isTBD = m.home === "TBD" || m.away === "TBD";
              const home = isTBD ? { code: "TBD" } : TEAMS[m.home];
              const away = isTBD ? { code: "TBD" } : TEAMS[m.away];
              const res = m.result;
              return (
                <th key={m.id} className="rg-match">
                  <div className="rg-match-teams">
                    <span>{home.code}</span>
                    <span className="rg-vs">v</span>
                    <span>{away.code}</span>
                  </div>
                  <div className="rg-match-meta">
                    {isKnockout(m) ? (STAGE_LABELS[m.stage] || m.stage) : `Group ${m.group}`}
                    {" · "}{fmtDateShort(m.date)}
                    {res && <span className="rg-final"> · FT {res.score ? res.score[0] : res[0]}-{res.score ? res.score[1] : res[1]}</span>}
                  </div>
                </th>
              );
            })}
            {/* pad empty header cells to keep column widths stable */}
            {Array.from({ length: PER_PAGE - pageMatches.length }).map((_, i) => (
              <th key={`pad-${i}`} className="rg-match rg-pad"></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {USERS.map(u => (
            <tr key={u.id} className={u.id === activeUserId ? "me" : ""}>
              <td className="rg-name">
                <span className="rg-avatar" style={{ background: u.color }}>{u.initials}</span>
                <span className="rg-name-text">{u.name}</span>
              </td>
              {pageMatches.map(m => {
                const lbl = pickLabel(predictions[`${u.id}:${m.id}`], m);
                let correct = false;
                if (lbl && m.result) {
                  const pred = predictions[`${u.id}:${m.id}`];
                  const sc = isKnockout(m)
                    ? scoreKnockoutPrediction(pred, m.result)
                    : scorePrediction(pred, m.result);
                  correct = sc && sc.pts > 0;
                }
                return (
                  <td key={m.id} className="rg-cell">
                    {lbl ? (
                      <span className={`rg-pick ${correct ? "correct" : ""} ${lbl.isDraw ? "draw" : ""}`}>
                        <span className="rg-winner">{lbl.winner}</span>
                        <span className="rg-score">({lbl.score})</span>
                      </span>
                    ) : (
                      <span className="rg-empty">—</span>
                    )}
                  </td>
                );
              })}
              {Array.from({ length: PER_PAGE - pageMatches.length }).map((_, i) => (
                <td key={`pad-${i}`} className="rg-cell rg-pad"></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- awards reveal ----------
function AwardsReveal({ awardPreds, awardWinners = {}, activeUserId }) {
  return (
    <div className="reveal-awards">
      {AWARDS.map(a => {
        const winner = awardWinners[a.id] ?? null;
        const settled = !!winner;
        return (
          <div key={a.id} className="reveal-award">
            <div className="reveal-award-head">
              <div className="reveal-award-name">{a.name}</div>
              {settled && (
                <div className="reveal-award-winner">
                  <span className="reveal-award-winner-label">Winner</span>
                  {winner}
                </div>
              )}
            </div>
            <div className="reveal-award-picks">
              {USERS.map(u => {
                const p = awardPreds[`${u.id}:${a.id}`];
                const has = p && p.submitted;
                const correct = has && settled
                  && scoreAwardPrediction(p.pick, winner) > 0;
                return (
                  <div
                    key={u.id}
                    className={`reveal-award-chip ${u.id === activeUserId ? "me" : ""} ${correct ? "correct" : ""}`}
                  >
                    <span className="reveal-award-avatar" style={{ background: u.color }}>{u.initials}</span>
                    <span className="reveal-award-pick">{has ? p.pick : "—"}</span>
                    {correct && <span className="reveal-award-tick">+5</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PickReveal;
