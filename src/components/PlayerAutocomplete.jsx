import { useState, useRef, useEffect, useMemo } from 'react';
import { PLAYERS, TEAM_NAMES } from '../lib/players.js';
import { TEAMS } from '../lib/data.js';

// Strip accents and lowercase for accent-insensitive matching
function normalise(s) {
  return (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// 3-stripe mini flag from TEAMS data
function MiniFlag({ code }) {
  const t = TEAMS[code];
  if (!t) return <span className="ac-flag-placeholder" />;
  return (
    <span className="ac-flag">
      <span style={{ background: t.c1 }} />
      <span style={{ background: t.c2 }} />
      <span style={{ background: t.c3 }} />
    </span>
  );
}

// Highlight matching substring in text
function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const norm = normalise(text);
  const q    = normalise(query);
  const idx  = norm.indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

// inputType: 'player' | 'team'
function PlayerAutocomplete({ value, onChange, disabled, placeholder, inputType = 'player' }) {
  const [query,  setQuery]  = useState(value ?? '');
  const [open,   setOpen]   = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef  = useRef(null);
  const listRef   = useRef(null);
  const noPlayers = PLAYERS.length === 0;

  // Sync external value changes (e.g. reset)
  useEffect(() => { setQuery(value ?? ''); }, [value]);

  const results = useMemo(() => {
    const q = normalise(query);
    if (!q || q.length < 2) return [];

    if (inputType === 'team') {
      return TEAM_NAMES
        .filter(t => normalise(t.name).includes(q) || normalise(t.shortName ?? '').includes(q))
        .slice(0, 8);
    }

    if (noPlayers) {
      // No squad data yet — fall back to team name search
      return TEAM_NAMES
        .filter(t => normalise(t.name).includes(q))
        .slice(0, 8);
    }

    return PLAYERS
      .filter(p => normalise(p.name).includes(q))
      .slice(0, 10);
  }, [query, inputType, noPlayers]);

  const select = (name) => {
    setQuery(name);
    onChange(name);
    setOpen(false);
    setActive(-1);
  };

  const handleKey = (e) => {
    if (!open) { if (e.key === 'ArrowDown') setOpen(true); return; }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && active >= 0) { e.preventDefault(); select(results[active].name); }
    if (e.key === 'Escape')     { setOpen(false); }
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    setOpen(true);
    setActive(-1);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!inputRef.current?.closest('.ac-wrap')?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (active >= 0 && listRef.current) {
      listRef.current.children[active]?.scrollIntoView({ block: 'nearest' });
    }
  }, [active]);

  const showDropdown = open && query.length >= 2;

  return (
    <div className="ac-wrap">
      <input
        ref={inputRef}
        type="text"
        className="award-input"
        value={query}
        placeholder={noPlayers && inputType === 'player' ? 'Run fetch-squads script to enable autocomplete' : (placeholder ?? '')}
        disabled={disabled}
        onChange={handleChange}
        onFocus={() => query.length >= 2 && setOpen(true)}
        onKeyDown={handleKey}
        autoComplete="off"
      />
      {showDropdown && (
        <ul className="ac-dropdown" ref={listRef} role="listbox">
          {results.length === 0 ? (
            <li className="ac-empty">No results for "{query}"</li>
          ) : results.map((item, i) => (
            <li
              key={item.name + (item.teamCode ?? '')}
              className={`ac-item ${i === active ? 'active' : ''}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); select(item.name); }}
              onMouseEnter={() => setActive(i)}
            >
              {inputType === 'player' && !noPlayers ? (
                <>
                  <MiniFlag code={item.teamCode} />
                  <span className="ac-item-name">
                    <Highlight text={item.name} query={query} />
                  </span>
                  <span className="ac-item-team">{item.teamCode}</span>
                </>
              ) : (
                <>
                  <MiniFlag code={item.code} />
                  <span className="ac-item-name">
                    <Highlight text={item.name} query={query} />
                  </span>
                  <span className="ac-item-team">{item.code}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlayerAutocomplete;
