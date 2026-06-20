import { useMemo } from 'react';
import {
  USERS,
  TEAMS,
  MATCHES,
  AWARDS,
  scorePrediction,
  scoreKnockoutPrediction,
  isKnockout,
  scoreAwardPrediction,
} from '../lib/data.js';
import { Avatar } from '../components/index.jsx';
import PickReveal from './PickReveal.jsx';


function LeaderboardPage({ activeUserId, predictions, awardPredictions, awardWinners = {}, matches: MATCHES, setView }) {
  const liveMatchesList = useMemo(() => MATCHES.filter(m => m.live), [MATCHES]);

  // Compute stats per user
  const rankings = useMemo(() => {
    const finals = MATCHES.filter(m => m.result);
    const awardPreds = awardPredictions || {};
    return USERS.map(u => {
      let pts = 0, exact = 0, outcome = 0, picks = 0;
      finals.forEach(m => {
        const p = predictions[`${u.id}:${m.id}`];
        if (!p || !p.submitted || p.home === null || p.away === null) return;
        picks++;
        const s = isKnockout(m)
          ? scoreKnockoutPrediction(p, m.result)
          : scorePrediction(p, m.result);
        if (!s) return;
        pts += s.pts;
        if (s.tags.includes("EXACT")) exact++;
        else if (s.tags.includes("OUTCOME")) outcome++;
      });
      // Awards: +5 each for correct settled awards
      let awardsHit = 0, awardsPts = 0;
      (AWARDS || []).forEach(a => {
        const winner = awardWinners[a.id];
        if (!winner) return;
        const pick = awardPreds[`${u.id}:${a.id}`];
        if (!pick || !pick.submitted) return;
        const earned = scoreAwardPrediction(pick.pick, winner);
        if (earned > 0) { awardsHit++; awardsPts += earned; }
      });
      pts += awardsPts;
      // Provisional points from in-progress matches (+3 outcome / +5 exact)
      let livePts = 0;
      liveMatchesList.forEach(m => {
        const p = predictions[`${u.id}:${m.id}`];
        if (!p || !p.submitted || p.home === null || p.away === null) return;
        const s = scorePrediction(p, m.live.score);
        if (s) livePts += s.pts;
      });
      return {
        user: u,
        pts,
        livePts,
        exact,
        outcome,
        picks,
        awardsHit,
        awardsPts,
        acc: picks > 0 ? Math.round(((exact + outcome) / picks) * 100) : 0
      };
    }).sort((a, b) => (b.pts + b.livePts) - (a.pts + a.livePts) || b.exact - a.exact || b.outcome - a.outcome);
  }, [predictions, awardPredictions, awardWinners, MATCHES, liveMatchesList]);

  const finalsCount = MATCHES.filter(m => m.result).length;
  const totalMatches = MATCHES.length;
  const top3 = rankings.slice(0, 3);
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean); // 2nd, 1st, 3rd

  const myRank = rankings.findIndex(r => r.user.id === activeUserId) + 1;
  const me = rankings.find(r => r.user.id === activeUserId);

  // Streaks: longest correct streak per user (mock)
  const streaks = useMemo(() => {
    return USERS.map(u => {
      const finals = MATCHES.filter(m => m.result);
      let cur = 0, best = 0;
      finals.forEach(m => {
        const p = predictions[`${u.id}:${m.id}`];
        if (!p || !p.submitted || p.home === null || p.away === null) { cur = 0; return; }
        const s = isKnockout(m)
          ? scoreKnockoutPrediction(p, m.result)
          : scorePrediction(p, m.result);
        if (s && s.pts > 0) { cur++; best = Math.max(best, cur); }
        else cur = 0;
      });
      return { user: u, best };
    }).sort((a, b) => b.best - a.best).slice(0, 3);
  }, [predictions, MATCHES]);


  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Standings · After {finalsCount} of {totalMatches} matches</div>
          <h1 className="page-title">The <em>table.</em></h1>
        </div>
        <div className="page-meta">
          <div><strong>{USERS.length}</strong> players in the pool</div>
          {me && <div>You: <strong>#{myRank}</strong> · {me.pts + me.livePts} pts{me.livePts > 0 ? ` (${me.livePts} live)` : ''}</div>}
          <div style={{ color: liveMatchesList.length > 0 ? "var(--heat)" : "var(--grass-deep)" }}>
            {liveMatchesList.length > 0 ? `${liveMatchesList.length} match${liveMatchesList.length > 1 ? 'es' : ''} live — points updating` : 'Updates after each full-time whistle'}
          </div>
        </div>
      </div>

      {liveMatchesList.length > 0 && (
        <div className="live-now-banner" style={{ marginBottom: 24 }}>
          <div className="live-now-header" style={{ marginBottom: 0 }}>
            <span className="live-dot" />
            <span className="live-now-title">LIVE — Points updating as goals go in</span>
            <span className="live-now-count">{liveMatchesList.length} match{liveMatchesList.length > 1 ? 'es' : ''} in progress · provisional</span>
          </div>
        </div>
      )}

      <div className="leaderboard-layout">
        <div>
          {/* Podium */}
          {podium.length === 3 && (
            <div className="podium">
              {[
                { spot: "second", entry: top3[1], rank: 2 },
                { spot: "first", entry: top3[0], rank: 1 },
                { spot: "third", entry: top3[2], rank: 3 }
              ].map(({ spot, entry, rank }) => (
                <div key={entry.user.id} className={`podium-spot ${spot}`}>
                  <div className="podium-rank">{rank}</div>
                  <div className="podium-avatar" style={{
                    background: entry.user.color,
                    width: rank === 1 ? 64 : 48,
                    height: rank === 1 ? 64 : 48,
                    fontSize: rank === 1 ? 18 : 14
                  }}>{entry.user.initials}</div>
                  <div className="podium-name">{entry.user.name}</div>
                  <div className="podium-pts">
                    <strong>{entry.pts + entry.livePts}</strong> PTS
                    {entry.livePts > 0 && <span className="live-dot" style={{ marginLeft: 8, verticalAlign: 'middle' }} />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full table */}
          <div className="rank-table">
            <div className="rank-row head">
              <div>Rank</div>
              <div>Player</div>
              <div style={{ textAlign: "center" }}>Picks</div>
              <div style={{ textAlign: "center" }}>Result</div>
              <div style={{ textAlign: "center" }}>Exact</div>
              <div style={{ textAlign: "center" }}>Acc</div>
              <div style={{ textAlign: "right" }}>Points</div>
            </div>
            {rankings.map((r, i) => (
              <div
                key={r.user.id}
                className={`rank-row ${r.user.id === activeUserId ? "me" : ""}`}
              >
                <div className="rank-num">{i + 1}</div>
                <div className="rank-user">
                  <Avatar user={r.user} />
                  <div>
                    <div className="rank-name">{r.user.name}</div>
                    <div className="rank-handle">@{r.user.name.toLowerCase().split(" ").join("")}</div>
                  </div>
                </div>
                <div className="rank-stat">
                  {r.picks}
                  <span className="sub">made</span>
                </div>
                <div className="rank-stat">
                  {r.outcome}
                  <span className="sub">result</span>
                </div>
                <div className="rank-stat">
                  {r.exact}
                  <span className="sub">exact</span>
                </div>
                <div className="rank-stat">
                  {r.acc}%
                  <span className="sub">hit-rate</span>
                </div>
                <div className="rank-pts">
                  {r.pts + r.livePts}
                  {r.livePts > 0 && (
                    <div className="rank-pts-live">
                      <span className="live-dot" style={{ width: 6, height: 6 }} />
                      +{r.livePts} live
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="sidebar">
          <div className="side-card dark">
            <div className="side-title">Scoring · Group Stage</div>
            <div className="scoring-rules">
              <div className="rule">
                <div className="rule-pts">+3</div>
                <div className="rule-text">
                  <strong>Correct outcome</strong>
                  <span>Right winner — or right draw</span>
                </div>
              </div>
              <div className="rule">
                <div className="rule-pts heat">+2</div>
                <div className="rule-text">
                  <strong>Exact goal score</strong>
                  <span>Bonus if your scoreline lands exactly</span>
                </div>
              </div>
              <div className="rule">
                <div className="rule-pts" style={{ color: "var(--grass)" }}>5</div>
                <div className="rule-text">
                  <strong>Max per match</strong>
                  <span>Outcome + exact score = full points</span>
                </div>
              </div>
            </div>
          </div>

          <div className="side-card">
            <div className="side-title">Awards Bonus</div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: 40,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "var(--gold)",
                lineHeight: 0.9
              }}>+5</div>
              <div style={{ fontSize: 12, lineHeight: 1.45, color: "var(--ink-2)" }}>
                <strong style={{ display: "block", marginBottom: 2 }}>Per correct award</strong>
                Golden Ball, Boot, Glove, Best Young Player, Fair Play — <strong>25 pts max</strong>.
              </div>
            </div>
          </div>

          <div className="side-card">
            <div className="side-title">Hot Streaks</div>
            <div className="streaks">
              {streaks.map(s => (
                <div key={s.user.id} className="streak">
                  <div className="streak-label">{s.user.name}</div>
                  <div className="streak-val">
                    <Avatar user={s.user} size={20} fontSize={8} />
                    <span>{s.best > 0 ? `${s.best}🔥` : "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="side-card">
            <div className="side-title">Tournament</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="streak" style={{ paddingBottom: 10 }}>
                <div className="streak-label">Matches Played</div>
                <div className="streak-val">{finalsCount} / {totalMatches}</div>
              </div>
              <div className="streak" style={{ paddingBottom: 10 }}>
                <div className="streak-label">Total Predictions</div>
                <div className="streak-val">{Object.keys(predictions).length}</div>
              </div>
              <div className="streak">
                <div className="streak-label">Stage</div>
                <div className="streak-val">Group</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <PickReveal predictions={predictions} awardPredictions={awardPredictions} awardWinners={awardWinners} activeUserId={activeUserId} matches={MATCHES} />
    </>
  );
}

export default LeaderboardPage;
