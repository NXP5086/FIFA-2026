import { MATCHES, USERS } from '../lib/data.js';


function RulesPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">How the Pool Works · Group Stage</div>
          <h1 className="page-title">The <em>rules.</em></h1>
        </div>
        <div className="page-meta">
          <div><strong>9</strong> players</div>
          <div><strong>{MATCHES.length}</strong> matches scored</div>
          <div style={{ color: "var(--grass-deep)" }}>Live-synced from the feed</div>
        </div>
      </div>

      <div className="rules-grid">
        {/* GROUP STAGE SCORING */}
        <section className="rules-card hero">
          <div className="rules-card-eyebrow">Scoring · Group Stage</div>
          <h2 className="rules-card-title">Two ways to earn points on every match.</h2>
          <div className="rules-points-row">
            <div className="rules-point">
              <div className="rules-point-num">+3</div>
              <div className="rules-point-label">Correct Outcome</div>
              <div className="rules-point-desc">
                You called the right winner, or you called a draw and the match ended level.
              </div>
            </div>
            <div className="rules-divider"></div>
            <div className="rules-point heat">
              <div className="rules-point-num">+2</div>
              <div className="rules-point-label">Exact Score</div>
              <div className="rules-point-desc">
                Bonus on top — your predicted scoreline matches the live result exactly.
              </div>
            </div>
            <div className="rules-divider"></div>
            <div className="rules-point grass">
              <div className="rules-point-num">5</div>
              <div className="rules-point-label">Max Per Match</div>
              <div className="rules-point-desc">
                Outcome + exact score together earn you the full five points.
              </div>
            </div>
          </div>
        </section>

        {/* KNOCKOUT SCORING */}
        <section className="rules-card hero ko">
          <div className="rules-card-eyebrow">Scoring · Knockout Stage</div>
          <h2 className="rules-card-title">Higher stakes. More ways to score.</h2>
          <div className="rules-points-row four">
            <div className="rules-point">
              <div className="rules-point-num">+5</div>
              <div className="rules-point-label">Correct Winner</div>
              <div className="rules-point-desc">
                Pick the team that advances — including penalty-shootout winners.
              </div>
            </div>
            <div className="rules-divider"></div>
            <div className="rules-point heat">
              <div className="rules-point-num">+2</div>
              <div className="rules-point-label">Correct Ending</div>
              <div className="rules-point-desc">
                Predict how it ends: Normal Time, Extra Time, or Penalties.
              </div>
            </div>
            <div className="rules-divider"></div>
            <div className="rules-point heat">
              <div className="rules-point-num">+2</div>
              <div className="rules-point-label">Exact Score + Ending</div>
              <div className="rules-point-desc">
                Additional bonus when the scoreline and ending both match. For penalties, that's the shootout score.
              </div>
            </div>
            <div className="rules-divider"></div>
            <div className="rules-point grass">
              <div className="rules-point-num">9</div>
              <div className="rules-point-label">Max Per Match</div>
              <div className="rules-point-desc">
                Nail winner, ending, and exact score for the full nine points.
              </div>
            </div>
          </div>
        </section>

        {/* AWARDS SCORING */}
        <section className="rules-card hero awards">
          <div className="rules-card-eyebrow">Scoring · Tournament Awards</div>
          <h2 className="rules-card-title">Five bonus points per correct call.</h2>
          <div className="rules-points-row">
            <div className="rules-point grass">
              <div className="rules-point-num">+5</div>
              <div className="rules-point-label">Per Correct Award</div>
              <div className="rules-point-desc">
                Predict any of the five tournament-end awards correctly and earn five points each.
              </div>
            </div>
            <div className="rules-divider"></div>
            <div className="rules-point heat">
              <div className="rules-point-num">5</div>
              <div className="rules-point-label">Awards In Play</div>
              <div className="rules-point-desc">
                Golden Ball · Golden Boot · Golden Glove · Best Young Player · FIFA Fair Play Award.
              </div>
            </div>
            <div className="rules-divider"></div>
            <div className="rules-point">
              <div className="rules-point-num">25</div>
              <div className="rules-point-label">Max From Awards</div>
              <div className="rules-point-desc">
                Sweep all five and add a full 25 points to your match-scoring total.
              </div>
            </div>
          </div>
        </section>

        {/* WORKED EXAMPLES — GROUP */}
        <section className="rules-card">
          <div className="rules-card-eyebrow">Worked Examples · Group</div>
          <h3 className="rules-card-subtitle">Group-stage scoring in practice</h3>
          <div className="examples-list">
            {[
              {
                pred: [2, 1], actual: [2, 1],
                pts: 5, tags: ["OUTCOME", "EXACT"],
                note: "Right winner + exact score. Maximum haul."
              },
              {
                pred: [2, 0], actual: [3, 1],
                pts: 3, tags: ["OUTCOME"],
                note: "Right winner, wrong scoreline. No exact-score bonus."
              },
              {
                pred: [1, 1], actual: [2, 2],
                pts: 3, tags: ["OUTCOME"],
                note: "You called a draw and got a draw. Three points."
              },
              {
                pred: [1, 1], actual: [1, 1],
                pts: 5, tags: ["OUTCOME", "EXACT"],
                note: "Exact draw predicted. Full five points."
              },
              {
                pred: [2, 1], actual: [1, 2],
                pts: 0, tags: [],
                note: "Wrong winner. Zero points, no consolation."
              }
            ].map((ex, i) => (
              <div key={i} className="example">
                <div className="example-cols">
                  <div className="example-col">
                    <div className="example-col-label">Your pick</div>
                    <div className="example-score">{ex.pred[0]} – {ex.pred[1]}</div>
                  </div>
                  <div className="example-arrow">→</div>
                  <div className="example-col">
                    <div className="example-col-label">Live score</div>
                    <div className="example-score">{ex.actual[0]} – {ex.actual[1]}</div>
                  </div>
                  <div className="example-tags">
                    {ex.tags.includes("EXACT") && <span className="tag exact">EXACT</span>}
                    {ex.tags.includes("OUTCOME") && !ex.tags.includes("EXACT") && (
                      <span className="tag outcome">RESULT</span>
                    )}
                    {ex.tags.length === 0 && <span className="tag">MISS</span>}
                  </div>
                  <div className={`example-pts ${ex.pts === 0 ? "zero" : ""}`}>
                    +{ex.pts}
                    <span className="example-pts-label">PTS</span>
                  </div>
                </div>
                <div className="example-note">{ex.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* WORKED EXAMPLES — KNOCKOUT */}
        <section className="rules-card">
          <div className="rules-card-eyebrow">Worked Examples · Knockout</div>
          <h3 className="rules-card-subtitle">Knockout scoring in practice</h3>
          <div className="examples-list">
            {[
              {
                pred: { s: [2, 1], end: "NT" },
                actual: { s: [2, 1], end: "NT" },
                pts: 9, tags: ["WINNER", "STAGE", "EXACT_STAGE"],
                note: "Right winner + right ending + exact score. Maximum haul."
              },
              {
                pred: { s: [3, 2], end: "ET" },
                actual: { s: [2, 1], end: "ET" },
                pts: 7, tags: ["WINNER", "STAGE"],
                note: "Right winner, right ending, wrong score. +5 winner + +2 ending."
              },
              {
                pred: { s: [5, 4], end: "PENS" },
                actual: { s: [5, 4], end: "PENS" },
                pts: 9, tags: ["WINNER", "STAGE", "EXACT_STAGE"],
                note: "Nailed the shootout score and the winner. Full nine — match-time score is ignored."
              },
              {
                pred: { s: [5, 3], end: "PENS" },
                actual: { s: [4, 2], end: "PENS" },
                pts: 7, tags: ["WINNER", "STAGE"],
                note: "Right team, right it-went-to-pens — wrong shootout score. +5 + +2."
              },
              {
                pred: { s: [2, 0], end: "NT" },
                actual: { s: [4, 3], end: "PENS" },
                pts: 5, tags: ["WINNER"],
                note: "Right team through, but you said normal time. Just the +5 winner."
              },
              {
                pred: { s: [3, 5], end: "PENS" },
                actual: { s: [5, 3], end: "PENS" },
                pts: 2, tags: ["STAGE"],
                note: "Wrong shootout winner. Only the +2 for calling penalties."
              },
              {
                pred: { s: [2, 1], end: "NT" },
                actual: { s: [0, 2], end: "NT" },
                pts: 2, tags: ["STAGE"],
                note: "Right ending, wrong winner. Just the +2 ending bonus."
              }
            ].map((ex, i) => (
              <div key={i} className="example">
                <div className="example-cols">
                  <div className="example-col">
                    <div className="example-col-label">Your pick</div>
                    <div className="example-score">
                      {ex.pred.s[0]} – {ex.pred.s[1]}
                      <span className="ko-stage-mark">{ex.pred.end}</span>
                    </div>
                  </div>
                  <div className="example-arrow">→</div>
                  <div className="example-col">
                    <div className="example-col-label">Result</div>
                    <div className="example-score">
                      {ex.actual.s[0]} – {ex.actual.s[1]}
                      <span className="ko-stage-mark">{ex.actual.end}</span>
                    </div>
                  </div>
                  <div className="example-tags">
                    {ex.tags.includes("WINNER") && <span className="tag outcome">WINNER</span>}
                    {ex.tags.includes("STAGE") && <span className="tag diff">STAGE</span>}
                    {ex.tags.includes("EXACT_STAGE") && <span className="tag exact">EXACT</span>}
                    {ex.tags.length === 0 && <span className="tag">MISS</span>}
                  </div>
                  <div className={`example-pts ${ex.pts === 0 ? "zero" : ""}`}>
                    +{ex.pts}
                    <span className="example-pts-label">PTS</span>
                  </div>
                </div>
                <div className="example-note">{ex.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="rules-card">
          <div className="rules-card-eyebrow">How It Works</div>
          <h3 className="rules-card-subtitle">Submission &amp; sync rules</h3>
          <div className="faq-list">
            <div className="faq">
              <div className="faq-num">01</div>
              <div className="faq-body">
                <div className="faq-q">Submit to lock in</div>
                <div className="faq-a">Predictions are editable until you press <strong>Submit Pick</strong> — or until your round's auto-lock window passes, whichever comes first.</div>
              </div>
            </div>
            <div className="faq">
              <div className="faq-num">02</div>
              <div className="faq-body">
                <div className="faq-q">Auto-lock windows</div>
                <div className="faq-a">
                  Each round locks <strong>2 hours before its first match kicks off</strong>:
                  <span style={{ display: "block", marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.7, letterSpacing: "0.02em", color: "var(--ink-2)" }}>
                    • Matchday 1 → 2h before MD1's first match<br />
                    • Matchday 2 &amp; 3 → 2h before MD2's first match<br />
                    • R32 / R16 / QF / SF → 2h before that round's first match<br />
                    • Third Place &amp; Final → 2h before the Third-Place kickoff<br />
                    • Awards → 2h before the first Semi-final
                  </span>
                </div>
              </div>
            </div>
            <div className="faq">
              <div className="faq-num">03</div>
              <div className="faq-body">
                <div className="faq-q">Live scores</div>
                <div className="faq-a">Once the tournament starts, live scores pull automatically from the official feed. Points are awarded provisionally while the match is in progress and finalised at full time.</div>
              </div>
            </div>
            <div className="faq">
              <div className="faq-num">04</div>
              <div className="faq-body">
                <div className="faq-q">Default scoreline</div>
                <div className="faq-a">Every match starts at 0 – 0 until you change it. If you submit at 0 – 0, that's what gets scored.</div>
              </div>
            </div>
            <div className="faq">
              <div className="faq-num">05</div>
              <div className="faq-body">
                <div className="faq-q">Knockout score field</div>
                <div className="faq-a">No draws in the knockouts — your pick must have a winner. For Normal Time or Extra Time, enter the score that ends the game. For <strong>Penalties</strong>, enter the <strong>shootout score</strong> (e.g. 4 – 3): only that score is scored for points — the match-time result (say 1 – 1 after extra time) is ignored entirely.</div>
              </div>
            </div>
            <div className="faq">
              <div className="faq-num">06</div>
              <div className="faq-body">
                <div className="faq-q">Group-stage extra time</div>
                <div className="faq-a">Group stage uses the 90-minute result only. Extra time and penalties only apply in the knockout rounds.</div>
              </div>
            </div>
            <div className="faq">
              <div className="faq-num">07</div>
              <div className="faq-body">
                <div className="faq-q">Tie-breakers on the leaderboard</div>
                <div className="faq-a">Equal points are broken by: (1) exact-score hits, (2) correct-result hits, (3) head-to-head pick differential.</div>
              </div>
            </div>
            <div className="faq">
              <div className="faq-num">08</div>
              <div className="faq-body">
                <div className="faq-q">Awards picks</div>
                <div className="faq-a">Type the player or team name exactly as FIFA announces it. Predictions are case- and whitespace-insensitive but the name itself must match — "Lionel Messi" works, "Messi" alone does not. Award picks auto-lock 2 hours before the first semi-final; edit freely until then.</div>
              </div>
            </div>
          </div>
        </section>
        <section className="rules-card glance">
          <div className="rules-card-eyebrow">At a Glance</div>
          <div className="glance-grid">
            <div className="glance-stat">
              <div className="glance-num">72</div>
              <div className="glance-label">Group matches</div>
            </div>
            <div className="glance-stat">
              <div className="glance-num">32</div>
              <div className="glance-label">Knockout matches</div>
            </div>
            <div className="glance-stat">
              <div className="glance-num">5 / 9 / 5</div>
              <div className="glance-label">Max pts · group / KO / award</div>
            </div>
            <div className="glance-stat">
              <div className="glance-num">673</div>
              <div className="glance-label">Max points possible</div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default RulesPage;
