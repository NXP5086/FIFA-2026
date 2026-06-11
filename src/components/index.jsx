import { useState, useEffect } from 'react';
import {
  USERS,
  TEAMS,
  TEAM_ISO2,
  VENUES,
  MATCHES,
  scorePrediction,
  scoreKnockoutPrediction,
  isKnockout,
  ENDING_LABELS,
  LOCK_WINDOWS,
  isMatchLocked,
} from '../lib/data.js';
import { fmtDateShort, fmtLock } from '../lib/format.js';

// ---------- atomic ----------
function LockStatus({ lockKey, nowMs }) {
  const lockAt = LOCK_WINDOWS ? LOCK_WINDOWS[lockKey] : null;
  if (lockAt == null) return null;
  const locked = (nowMs || Date.now()) >= lockAt;
  return (
    <span className={`lock-status ${locked ? "closed" : "open"}`}>
      <span className="lock-status-icon">{locked ? "🔒" : "🔓"}</span>
      {locked ? "Picks closed" : <>Locks {fmtLock(lockAt)}</>}
    </span>
  );
}

// ---------- atomic ----------
function Flag({ team }) {
  const iso2 = TEAM_ISO2[team.code];
  return (
    <div className="flag" aria-label={team.name}>
      {iso2
        ? <img
            src={`https://flagcdn.com/w40/${iso2}.png`}
            alt={team.name}
            className="flag-img"
          />
        : (
          <>
            <span style={{ background: team.c1 }} />
            <span style={{ background: team.c2 }} />
            <span style={{ background: team.c3 }} />
          </>
        )
      }
    </div>
  );
}

function Avatar({ user, size = 36, fontSize }) {
  return (
    <div
      className="rank-avatar"
      style={{
        background: user.color,
        width: size,
        height: size,
        fontSize: fontSize || Math.round(size * 0.34)
      }}
    >
      {user.initials}
    </div>
  );
}

// ---------- live sync strip ----------
function LiveSyncStrip({ matches = [], lastSync, onSync }) {
  const [syncing, setSyncing] = useState(false);
  const [, tick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => tick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const liveCount  = matches.filter(m => m.live).length;
  const finalCount = matches.filter(m => m.result).length;
  const upcomingCount = matches.length - liveCount - finalCount;

  const ago = (() => {
    if (!lastSync) return 'never';
    const s = Math.floor((Date.now() - lastSync.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  })();

  const doSync = async () => {
    setSyncing(true);
    await onSync?.();
    setSyncing(false);
  };

  return (
    <div className="syncstrip">
      <div className="syncstrip-inner">
        <div className="syncstrip-left">
          <span className="live-dot"></span>
          <span className="syncstrip-status">Live Feed Connected</span>
          <span className="syncstrip-divider">/</span>
          <span className="syncstrip-meta">
            <strong>{liveCount}</strong> live · <strong>{finalCount}</strong> final · <strong>{upcomingCount}</strong> upcoming
          </span>
        </div>
        <div className="syncstrip-right">
          <span className="syncstrip-meta">
            {syncing ? 'Syncing…' : `Synced ${ago}`}
          </span>
          <button className="syncstrip-btn" onClick={doSync} disabled={syncing}>
            <span className={`sync-icon ${syncing ? 'spinning' : ''}`}>↻</span>
            Sync Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- topbar ----------
function TopBar({ profile, onLogout, view, setView, isAdmin }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="wordmark">
          <svg className="trophy" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#F5F3EE" stroke="#0E1116" strokeWidth="1" />
            <path d="M12 7.5 L15.5 10 L14.2 14 L9.8 14 L8.5 10 Z" fill="#0E1116" />
            <path d="M12 7.5 L12 4 L15 5 L15.5 10 Z" fill="#0E1116" />
            <path d="M15.5 10 L15 5 L18.5 7 L19.5 11 Z" fill="#0E1116" />
            <path d="M14.2 14 L15.5 10 L19.5 11 L18 15 Z" fill="#0E1116" />
            <path d="M9.8 14 L14.2 14 L15 17.5 L12 19 L9 17.5 Z" fill="#0E1116" />
            <path d="M9.8 14 L8.5 10 L4.5 11 L6 15 Z" fill="#0E1116" />
            <path d="M8.5 10 L9 5 L12 4 L12 7.5 Z" fill="#0E1116" />
            <path d="M8.5 10 L4.5 11 L5.5 7 L9 5 Z" fill="#0E1116" />
            <path d="M12 7.5 L15.5 10 L14.2 14 L9.8 14 L8.5 10 Z" fill="none" stroke="#F5F3EE" strokeWidth="0.6" />
            <circle cx="12" cy="12" r="10" fill="none" stroke="#0E1116" strokeWidth="1.2" />
          </svg>
          <div className="mark-stack">
            <span className="mark-26 line-1">WORLD CUP</span>
            <span className="mark-26 line-2">'26</span>
          </div>
          <span className="mark-sub">PREDICTION POOL</span>
        </div>
        <nav className="nav">
          <button className={view === "schedule" ? "active" : ""} onClick={() => setView("schedule")}>Schedule</button>
          <button className={view === "awards" ? "active" : ""} onClick={() => setView("awards")}>Awards</button>
          <button className={view === "leaderboard" ? "active" : ""} onClick={() => setView("leaderboard")}>Leaderboard</button>
          <button className={view === "rules" ? "active" : ""} onClick={() => setView("rules")}>Rules</button>
          {isAdmin && (
            <button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")}
              style={{ color: 'var(--heat)' }}>
              Admin
            </button>
          )}
        </nav>
        {profile && (
          <div className="user-pick">
            <span className="user-pick-label">Playing&nbsp;as</span>
            <div className="user-identity">
              <div className="avatar" style={{ background: profile.color }}>
                {profile.initials}
              </div>
              <span className="user-identity-name">{profile.name}</span>
              <button className="logout-btn" onClick={onLogout} title="Sign out" type="button">
                ↩
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ---------- match card ----------
function MatchCard({ match, prediction, onPredict, locked: lockedProp, nowMs }) {
  const home = TEAMS[match.home];
  const away = TEAMS[match.away];
  const venue = VENUES[match.venue];
  const isFinal = !!match.result;
  const isLive = !!match.live && !isFinal;
  const isSubmitted = !!(prediction && prediction.submitted);
  const isKO = isKnockout(match);
  const isTBD = match.home === "TBD" || match.away === "TBD";
  const timeLocked = !lockedProp && isMatchLocked
    ? isMatchLocked(match, nowMs)
    : false;
  const locked = lockedProp || timeLocked;
  const liveOrFinal = isFinal ? match.result : (isLive ? match.live.score : null);
  const points = isFinal && prediction
    ? (isKO ? scoreKnockoutPrediction(prediction, match.result)
            : scorePrediction(prediction, match.result))
    : (isLive && prediction && !isKO ? scorePrediction(prediction, match.live.score) : null);
  const inputsLocked = locked || isFinal || isLive || isSubmitted || isTBD;

  // Can submit?
  let canSubmit = false;
  if (!isTBD && !locked && !isFinal && !isLive && !isSubmitted && prediction && prediction.home !== null && prediction.away !== null) {
    if (isKO) {
      // Knockouts: scores can't be equal (no draws — someone must advance) AND ending must be set
      canSubmit = !!prediction.ending && prediction.home !== prediction.away;
    } else {
      canSubmit = true;
    }
  }

  const handleChange = (side, val) => {
    if (inputsLocked) return;
    const cap = isKO && prediction?.ending === "PENS" ? 20 : 9;
    const n = val === "" ? null : Math.max(0, Math.min(cap, parseInt(val, 10) || 0));
    const base = prediction || { home: null, away: null };
    const other = side === "home" ? "away" : "home";
    const next = { ...base, [side]: n };
    // The untouched side shows "0" — persist that as a real 0 so the saved draft
    // matches what's on screen and the pick is actually submittable.
    if (next[other] == null) next[other] = 0;
    onPredict(next); // auto-saves immediately (not locked until Submit)
  };

  const setEnding = (ending) => {
    if (inputsLocked) return;
    const base = prediction || { home: 0, away: 0 };
    const next = {
      ...base,
      home: base.home == null ? 0 : base.home,
      away: base.away == null ? 0 : base.away,
      ending
    };
    onPredict(next); // auto-saves immediately
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onPredict({ ...prediction, submitted: true });
  };

  // Short badge labels — long stage names like "Round of 32" don't fit in the meta pill
  const SHORT_STAGE = { R32: "R32", R16: "R16", QF: "QF", SF: "SF", "3RD": "3RD PLACE", F: "FINAL" };
  const stageBadge = isKO
    ? (SHORT_STAGE[match.stage] || match.stage)
    : `GROUP ${match.group}`;

  // Display label for each team — falls back to the slot descriptor when TBD
  const homeDisplay = match.home === "TBD"
    ? { code: "TBD", name: match.homeLabel || "To be determined" }
    : { code: home.code, name: home.name };
  const awayDisplay = match.away === "TBD"
    ? { code: "TBD", name: match.awayLabel || "To be determined" }
    : { code: away.code, name: away.name };

  return (
    <div className={`match ${isFinal ? "completed" : ""} ${isLive ? "live" : ""} ${isSubmitted && !isFinal && !isLive ? "submitted" : ""} ${isKO ? "knockout" : ""} ${isTBD ? "tbd" : ""} ${locked ? "locked" : ""}`}>
      <div className="match-meta">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className={`badge-group ${isKO ? "ko" : ""}`}>{stageBadge}</span>
          {!isKO && <span>MD {match.matchday}</span>}
          {isKO && match.matchNum && <span>MATCH {match.matchNum}</span>}
          {isKO && <span>{fmtDateShort(match.date)} IST</span>}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isLive ? (
            <span className="status-live">
              <span className="live-dot"></span>
              LIVE · {match.live.minute}'
            </span>
          ) : isFinal ? (
            <span className="status-final">● FULL TIME</span>
          ) : null}
        </div>
      </div>

      <div className="match-body">
        <div className="team home">
          {match.home === "TBD"
            ? <div className="flag tbd-flag"><span>?</span></div>
            : <Flag team={home} />}
          <div className="team-name">
            <span className="team-code">{homeDisplay.code}</span>
            <span className="team-fullname">{homeDisplay.name}</span>
          </div>
        </div>

        {isFinal || isLive ? (
          <div className={`score-input final ${isLive ? "live" : ""}`}>
            <div className="score-row">
              <div className="actual">{liveOrFinal[0]}</div>
              <span className="dash">–</span>
              <div className="actual">{liveOrFinal[1]}</div>
            </div>
            <div className="label">{isLive ? "LIVE" : "FINAL"}</div>
          </div>
        ) : isSubmitted ? (
          <div className="score-input final submitted">
            <div className="score-row">
              <div className="actual">{prediction.home}</div>
              <span className="dash">–</span>
              <div className="actual">{prediction.away}</div>
            </div>
            <div className="label">{isKO && prediction.ending === "PENS" ? "ON PENS" : "SUBMITTED"}</div>
          </div>
        ) : isTBD ? (
          <div className="score-input final tbd">
            <div className="score-row">
              <div className="actual">–</div>
              <span className="dash">vs</span>
              <div className="actual">–</div>
            </div>
            <div className="label">TBD</div>
          </div>
        ) : (
          <div className="score-input">
            <input
              type="number"
              min="0"
              max={isKO && prediction?.ending === "PENS" ? "20" : "9"}
              value={prediction?.home ?? 0}
              disabled={inputsLocked}
              onChange={(e) => handleChange("home", e.target.value)}
              aria-label={`${home.name} predicted score`}
            />
            <span className="dash">vs</span>
            <input
              type="number"
              min="0"
              max={isKO && prediction?.ending === "PENS" ? "20" : "9"}
              value={prediction?.away ?? 0}
              disabled={inputsLocked}
              onChange={(e) => handleChange("away", e.target.value)}
              aria-label={`${away.name} predicted score`}
            />
            {isKO && (
              <div className="score-context">
                {prediction?.ending === "PENS"
                  ? "Shootout score"
                  : prediction?.ending === "ET"
                  ? "Score after ET"
                  : prediction?.ending === "NT"
                  ? "Score at 90'"
                  : "Final score"}
              </div>
            )}
          </div>
        )}

        <div className="team away">
          {match.away === "TBD"
            ? <div className="flag tbd-flag"><span>?</span></div>
            : <Flag team={away} />}
          <div className="team-name">
            <span className="team-code">{awayDisplay.code}</span>
            <span className="team-fullname">{awayDisplay.name}</span>
          </div>
        </div>
      </div>

      {/* Knockout extras: ending stage (score itself becomes pens score when ending=PENS) */}
      {isKO && !isFinal && !isLive && !isTBD && (
        <div className="ko-extras">
          {isSubmitted ? (
            <div className="ko-extras-readonly">
              <span className="ko-extras-label">Ends in</span>
              <span className="ko-extras-val">{ENDING_LABELS[prediction.ending] || "—"}</span>
              <span className="ko-extras-sep">·</span>
              <span className="ko-extras-label">{prediction.ending === "PENS" ? "Wins shootout" : "Winner"}</span>
              <span className="ko-extras-val">
                {prediction.home > prediction.away ? home.code : away.code}
              </span>
            </div>
          ) : (
            <>
              <div className="ko-row">
                <span className="ko-label">Ends in</span>
                <div className="ko-radio-group">
                  {["NT", "ET", "PENS"].map(opt => (
                    <button
                      type="button"
                      key={opt}
                      className={`ko-radio ${prediction?.ending === opt ? "active" : ""}`}
                      onClick={() => setEnding(opt)}
                      disabled={inputsLocked}
                    >
                      {ENDING_LABELS[opt]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ko-hint">
                {prediction?.ending === "PENS"
                  ? <>Enter the <strong>penalty-shootout score</strong> above (e.g. 5 – 4). Only the shootout score is scored — the match-time result is ignored. The winner is whoever has more pens.</>
                  : prediction?.ending === "ET"
                  ? <>Enter the score <strong>after extra time</strong> above. The match can't end level.</>
                  : prediction?.ending === "NT"
                  ? <>Enter the score <strong>at 90 minutes</strong> above. The match can't end level.</>
                  : <>Pick how the match ends. A knockout pick can't be a draw — someone must advance.</>}
              </div>
            </>
          )}
        </div>
      )}

      <div className="match-footer">
        <div className="pred-status">
          <span className="dot" style={{
            background: isSubmitted
              ? "var(--grass)"
              : (prediction && prediction.home !== null && prediction.away !== null
                ? "var(--gold)" : "var(--ink-3)")
          }} />
          <span>
            {venue.stadium}, {venue.city}
          </span>
        </div>

        {(isFinal || (isLive && !isKO)) && prediction && points && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="tag-list">
              {!isKO && points.tags.includes("EXACT") && <span className="tag exact">EXACT</span>}
              {!isKO && points.tags.includes("OUTCOME") && !points.tags.includes("EXACT") && (
                <span className="tag outcome">RESULT</span>
              )}
              {isKO && points.tags.includes("WINNER") && <span className="tag outcome">WINNER</span>}
              {isKO && points.tags.includes("STAGE") && <span className="tag diff">STAGE</span>}
              {isKO && points.tags.includes("EXACT_STAGE") && <span className="tag exact">EXACT+STAGE</span>}
              {isLive && <span className="tag diff">PROV.</span>}
            </div>
            <span className={`points-pill ${points.pts === 0 ? "zero" : ""}`}>
              +{points.pts} PTS
            </span>
          </div>
        )}
        {(isFinal || isLive) && !prediction && (
          <span style={{ color: "var(--ink-3)", fontStyle: "italic" }}>NO PICK</span>
        )}
        {!isFinal && !isLive && isSubmitted && (
          <span className="submitted-badge">
            <span className="check">✓</span> SUBMITTED · LOCKED
          </span>
        )}
        {!isFinal && !isLive && !isSubmitted && isTBD && (
          <span style={{
            color: "var(--ink-3)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase"
          }}>
            Awaiting bracket
          </span>
        )}
        {!isFinal && !isLive && !isSubmitted && !isTBD && locked && (
          <span className="locked-badge">
            <span className="lock-icon">🔒</span> PICKS CLOSED
          </span>
        )}
        {!isFinal && !isLive && !isSubmitted && !isTBD && !locked && (
          <div className="footer-actions">
            {prediction && (prediction.home != null || prediction.away != null) && (
              <span className="draft-saved">
                <span className="draft-dot"></span> Draft saved
              </span>
            )}
            <button
              type="button"
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!canSubmit}
              title={isKO && !canSubmit ? "Pick a score and ending stage (and pens winner if drawn)" : ""}
            >
              Submit Pick →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export { TopBar, MatchCard, Flag, Avatar, LiveSyncStrip, LockStatus };
