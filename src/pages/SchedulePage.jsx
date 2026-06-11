import { useState, useMemo, useEffect } from 'react';
import {
  USERS,
  TEAMS,
  GROUPS,
  MATCHES,
  isKnockout,
  STAGE_LABELS,
} from '../lib/data.js';
import { fmtDate, dayKey } from '../lib/format.js';
import { MatchCard, LockStatus } from '../components/index.jsx';


function SchedulePage({ activeUserId, predictions, onPredict, matches: MATCHES, showToast }) {
  const [phase, setPhase] = useState("GROUP"); // GROUP | KO
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [matchdayFilter, setMatchdayFilter] = useState("ALL");
  const [koStageFilter, setKoStageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [nowMs, setNowMs] = useState(Date.now());

  // Tick every 30s so auto-lock windows flip live without a refresh
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const matches = useMemo(() => {
    return MATCHES.filter(m => {
      const isKO = isKnockout(m);
      if (phase === "GROUP" && isKO) return false;
      if (phase === "KO" && !isKO) return false;

      if (phase === "GROUP") {
        if (groupFilter !== "ALL" && m.group !== groupFilter) return false;
        if (matchdayFilter !== "ALL" && m.matchday !== matchdayFilter) return false;
      } else {
        if (koStageFilter !== "ALL" && m.stage !== koStageFilter) return false;
      }
      if (statusFilter === "FINAL" && !m.result) return false;
      if (statusFilter === "UPCOMING" && m.result) return false;
      if (search) {
        const q = search.toLowerCase();
        const h = TEAMS[m.home];
        const a = TEAMS[m.away];
        if (!h.name.toLowerCase().includes(q)
          && !a.name.toLowerCase().includes(q)
          && !h.code.toLowerCase().includes(q)
          && !a.code.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [phase, groupFilter, matchdayFilter, koStageFilter, statusFilter, search]);

  // Group: matchday → date
  const byMatchday = useMemo(() => {
    if (phase !== "GROUP") return [];
    const md = new Map();
    matches.forEach(m => {
      if (!md.has(m.matchday)) md.set(m.matchday, new Map());
      const dateMap = md.get(m.matchday);
      const k = dayKey(m.date);
      if (!dateMap.has(k)) dateMap.set(k, []);
      dateMap.get(k).push(m);
    });
    return Array.from(md.entries())
      .sort(([a], [b]) => a - b)
      .map(([mdNum, dateMap]) => [
        mdNum,
        Array.from(dateMap.entries()).sort(([a], [b]) => a.localeCompare(b))
      ]);
  }, [matches, phase]);

  // Knockout: stage (R16 → QF → SF → 3RD → F)
  const byKoStage = useMemo(() => {
    if (phase !== "KO") return [];
    const order = ["R32", "R16", "QF", "SF", "3RD", "F"];
    const map = new Map();
    matches.forEach(m => {
      if (!map.has(m.stage)) map.set(m.stage, []);
      map.get(m.stage).push(m);
    });
    return order
      .filter(s => map.has(s))
      .map(s => [s, map.get(s).sort((a, b) => a.date.localeCompare(b.date))]);
  }, [matches, phase]);

  const handlePredict = (matchId, pred) => {
    onPredict(matchId, pred);
  };

  // Matches that are currently live (admin-confirmed) or in their time window
  const MATCH_WINDOW_MS = 115 * 60 * 1000; // 90 min + stoppage buffer
  const liveOrInWindow = useMemo(() => {
    return MATCHES.filter(m => {
      if (m.result) return false; // already final
      if (m.live) return true;    // admin-confirmed live
      if (m.home === 'TBD' || m.away === 'TBD') return false;
      const kick = new Date(m.date).getTime();
      return nowMs >= kick && nowMs < kick + MATCH_WINDOW_MS;
    });
  }, [MATCHES, nowMs]);

  // stats for this user (counts submitted only, across whichever phase is active)
  const userStats = useMemo(() => {
    const user = USERS.find(u => u.id === activeUserId);
    let made = 0, total = 0;
    MATCHES.forEach(m => {
      const isKO = isKnockout(m);
      if (phase === "GROUP" && isKO) return;
      if (phase === "KO" && !isKO) return;
      if (m.result || m.live) return;
      // Skip knockouts where teams aren't known yet
      if (m.home === "TBD" || m.away === "TBD") return;
      total++;
      const p = predictions[`${activeUserId}:${m.id}`];
      if (p && p.submitted) made++;
    });
    return { user, made, total };
  }, [activeUserId, predictions, phase]);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">
            {phase === "GROUP"
              ? "Group Stage · 12 Jun – 28 Jun 2026 IST"
              : "Knockout Stage · 28 Jun – 20 Jul 2026 IST"}
          </div>
          <h1 className="page-title">Make your <em>picks.</em></h1>
        </div>
        <div className="page-meta">
          <div><strong>{userStats.made}/{userStats.total}</strong> picks submitted</div>
          <div>{userStats.total - userStats.made} matches open</div>
          <div style={{ color: "var(--grass-deep)" }}>Each round locks 2h before its first match</div>
        </div>
      </div>

      {/* Live Now banner — shows admin-confirmed live + time-window matches */}
      {liveOrInWindow.length > 0 && (
        <div className="live-now-banner">
          <div className="live-now-header">
            <span className="live-dot"></span>
            <span className="live-now-title">LIVE NOW</span>
            <span className="live-now-count">{liveOrInWindow.length} {liveOrInWindow.length === 1 ? 'match' : 'matches'} in progress</span>
          </div>
          <div className="matches-grid">
            {liveOrInWindow.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                prediction={predictions[`${activeUserId}:${m.id}`]}
                onPredict={(p) => handlePredict(m.id, p)}
                nowMs={nowMs}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase tabs */}
      <div className="phase-tabs">
        <button
          className={`phase-tab ${phase === "GROUP" ? "active" : ""}`}
          onClick={() => setPhase("GROUP")}
        >
          <span className="phase-tab-label">Group Stage</span>
          <span className="phase-tab-meta">72 matches · 12 groups</span>
        </button>
        <button
          className={`phase-tab ${phase === "KO" ? "active" : ""}`}
          onClick={() => setPhase("KO")}
        >
          <span className="phase-tab-label">Knockouts</span>
          <span className="phase-tab-meta">R32 → Final · 32 matches</span>
        </button>
      </div>

      <div className="filters">
        {phase === "GROUP" ? (
          <>
            <div className="filter-group">
              <span className="filter-group-label">Group</span>
              <button className={`chip ${groupFilter === "ALL" ? "active" : ""}`} onClick={() => setGroupFilter("ALL")}>All</button>
              {Object.keys(GROUPS).map(g => (
                <button
                  key={g}
                  className={`chip ${groupFilter === g ? "active" : ""}`}
                  onClick={() => setGroupFilter(g)}
                >{g}</button>
              ))}
            </div>
            <div className="filter-group">
              <span className="filter-group-label">MD</span>
              <button className={`chip ${matchdayFilter === "ALL" ? "active" : ""}`} onClick={() => setMatchdayFilter("ALL")}>All</button>
              {[1, 2, 3].map(md => (
                <button
                  key={md}
                  className={`chip ${matchdayFilter === md ? "active" : ""}`}
                  onClick={() => setMatchdayFilter(md)}
                >{md}</button>
              ))}
            </div>
          </>
        ) : (
          <div className="filter-group">
            <span className="filter-group-label">Round</span>
            <button className={`chip ${koStageFilter === "ALL" ? "active" : ""}`} onClick={() => setKoStageFilter("ALL")}>All</button>
            {[
              ["R32", "R32"], ["R16", "R16"], ["QF", "QF"], ["SF", "SF"], ["3RD", "3rd"], ["F", "Final"]
            ].map(([code, label]) => (
              <button
                key={code}
                className={`chip ${koStageFilter === code ? "active" : ""}`}
                onClick={() => setKoStageFilter(code)}
              >{label}</button>
            ))}
          </div>
        )}
        <div className="search">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search teams…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {phase === "GROUP" && byMatchday.length === 0 && <div className="empty">No matches match your filters</div>}
      {phase === "KO" && byKoStage.length === 0 && <div className="empty">No matches match your filters</div>}

      {phase === "KO" && MATCHES.some(m => isKnockout(m) && (m.home === "TBD" || m.away === "TBD")) && (
        <div className="bracket-notice">
          <span className="bracket-notice-icon">⏳</span>
          <div>
            <strong>Knockout bracket isn't set yet.</strong> It's determined by who finishes 1st, 2nd,
            and best 3rd in each group — which won't be known until the group stage ends on
            <strong> 28 June IST</strong>. Cards showing "Awaiting bracket" will unlock for predictions
            once the real teams are confirmed.
          </div>
        </div>
      )}

      {phase === "GROUP" && byMatchday.map(([mdNum, dateGroups]) => {
        const totalInMd = dateGroups.reduce((acc, [, ms]) => acc + ms.length, 0);
        const finalInMd = dateGroups.reduce(
          (acc, [, ms]) => acc + ms.filter(m => m.result).length, 0
        );
        const liveInMd = dateGroups.reduce(
          (acc, [, ms]) => acc + ms.filter(m => m.live).length, 0
        );
        return (
          <section key={mdNum} className="md-block">
            <div className="md-block-header">
              <div className="md-block-title">
                <span className="md-block-eyebrow">Matchday</span>
                <span className="md-block-num">{mdNum}</span>
              </div>
              <div className="md-block-meta">
                <span><strong>{totalInMd}</strong> fixtures</span>
                {liveInMd > 0 && <span className="md-block-live"><span className="live-dot"></span><strong>{liveInMd}</strong> live</span>}
                <span><strong>{finalInMd}</strong> final</span>
                <span><strong>{totalInMd - finalInMd - liveInMd}</strong> upcoming</span>
                <LockStatus lockKey={mdNum === 1 ? "MD1" : "MD23"} nowMs={nowMs} />
              </div>
            </div>

            {dateGroups.map(([k, ms]) => (
              <div key={k} className="matchday-section">
                <div className="matchday-header">
                  <div className="matchday-date">{fmtDate(ms[0].date)} <span className="matchday-tz">IST</span></div>
                  <div className="matchday-meta">{ms.length} {ms.length === 1 ? "fixture" : "fixtures"}</div>
                </div>
                <div className="matches-grid">
                  {ms.map(m => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      prediction={predictions[`${activeUserId}:${m.id}`]}
                      onPredict={(p) => handlePredict(m.id, p)}
                      nowMs={nowMs}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}

      {phase === "KO" && byKoStage.map(([stage, ms]) => (
        <section key={stage} className="md-block">
          <div className="md-block-header">
            <div className="md-block-title">
              <span className="md-block-eyebrow">Round</span>
              <span className="md-block-num" style={{ fontSize: 56 }}>
                {STAGE_LABELS[stage]}
              </span>
            </div>
          <div className="md-block-meta">
            <span><strong>{ms.length}</strong> {ms.length === 1 ? "fixture" : "fixtures"}</span>
            {stage === "GROUP" ? null : <span>Max <strong>9</strong> pts per match</span>}
            {(stage === "R32" || stage === "R16") && ms.some(m => m.home === "TBD") && (
              <span style={{ color: "var(--ink-3)", fontStyle: "italic" }}>
                Bracket fills in after group stage
              </span>
            )}
            <LockStatus lockKey={stage === "F" ? "F3RD" : stage} nowMs={nowMs} />
          </div>
          </div>
          <div className="matches-grid">
            {ms.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                prediction={predictions[`${activeUserId}:${m.id}`]}
                onPredict={(p) => handlePredict(m.id, p)}
                nowMs={nowMs}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export default SchedulePage;
