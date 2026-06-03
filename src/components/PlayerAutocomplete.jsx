import { useState, useRef, useEffect, useMemo } from 'react';
import { PLAYERS, TEAM_NAMES } from '../lib/players.js';
import { TEAMS } from '../lib/data.js';

function normalise(s) {
  return (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

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

function PlayerAutocomplete({ value, onChange, disabled, placeholder, inputType = 'player' }) {
  const [query,  setQuery]  = useState(value ?? '');
  const [open,   setOpen]   = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef  = useRef(null);
  const listRef  = useRef(null);
  const noPlayers = PLAYERS.length === 0;

  useEffect(() => { setQuery(value ?? ''); }, [value]);

  const results = useMemo(() => {
    const q = normalise(query);
    if (!q) return [];
    if (inputType === 'team') {
      return TEAM_NAMES
        .filter(t => normalise(t.name).includes(q) || normalise(t.shortName ?? '').includes(q))
        .slice(0, 8);
    }
    if (noPlayers) {
      return TEAM_NAMES.filter(t => normalise(t.name).includes(q)).slice(0, 8);
    }
    return PLAYERS.filter(p => normalise(p.name).includes(q)).slice(0, 10);
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
    console.log('[AC] handleChange', { v, open, wrapRect: wrapRef.current?.getBoundingClientRect() });
    setQuery(v);
    onChange(v);
    setOpen(true);
    setActive(-1);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (active >= 0 && listRef.current) {
      listRef.current.children[active]?.scrollIntoView({ block: 'nearest' });
    }
  }, [active]);

  const showDropdown = open && query.length >= 1;
  console.log('[AC] render', { query, open, showDropdown, wrapRef: !!wrapRef.current });

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        className="award-input"
        style={{ width: '100%' }}
        value={query}
        placeholder={placeholder ?? ''}
        disabled={disabled}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        autoComplete="off"
      />
      {showDropdown && (
        <ul
          ref={listRef}
          className="ac-dropdown"
          style={{
            position: 'fixed',
            zIndex: 99999,
            left: wrapRef.current ? wrapRef.current.getBoundingClientRect().left : 0,
            top:  wrapRef.current ? wrapRef.current.getBoundingClientRect().bottom + 4 : 0,
            width: wrapRef.current ? wrapRef.current.getBoundingClientRect().width : 300,
          }}
          role="listbox"
        >
          {results.length === 0 ? (
            <li className="ac-empty">
              {noPlayers && inputType === 'player'
                ? 'Run node scripts/fetch-squads.mjs to enable player search'
                : `No results for "${query}"`}
            </li>
          ) : results.map((item, i) => (
            <li
              key={item.name + (item.teamCode ?? item.code ?? '')}
              className={`ac-item ${i === active ? 'active' : ''}`}
              role="option"
              onMouseDown={(e) => { e.preventDefault(); select(item.name); }}
              onMouseEnter={() => setActive(i)}
            >
              <MiniFlag code={item.teamCode ?? item.code} />
              <span className="ac-item-name">
                <Highlight text={item.name} query={query} />
              </span>
              <span className="ac-item-team">{item.teamCode ?? item.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlayerAutocomplete;
