// =============================================================
// PARTICIPANT CONFIGURATION
// Maps each participant's email to their pool identity.
// internal_id must match one of the IDs in data.js USERS.
//
// When someone signs in for the first time via magic link,
// the app looks up their email here and auto-creates their
// Supabase profile with the matching name, initials, and colour.
// =============================================================

export const PARTICIPANT_CONFIG = [
  
  { email: "participant1@example.com",        internal_id: "u1",  name: "Mrigank",     initials: "MS", color: "#DC2626" },
  { email: "participant2@example.com",           internal_id: "u2",  name: "Pooja",       initials: "PJ", color: "#2DD4BF" },
  { email: "participant3@example.com",           internal_id: "u3",  name: "Heril",       initials: "HS", color: "#06B6D4" },
  { email: "participant4@example.com",      internal_id: "u4",  name: "Shefali",     initials: "SG", color: "#EC4899" },
  { email: "participant5@example.com",        internal_id: "u5",  name: "Imtinok",     initials: "IP", color: "#8B5CF6" },
  { email: "participant6@example.com",           internal_id: "u6",  name: "Tali",        initials: "TI", color: "#10A86C" },
  { email: "participant7@example.com",               internal_id: "u7",  name: "Pura",        initials: "PU", color: "#F59E0B" },
  { email: "participant8@example.com",                 internal_id: "u8",  name: "Bivin",       initials: "BV", color: "#EF4444" },
  { email: "participant9@example.com",             internal_id: "u9",  name: "Aosen",       initials: "AJ", color: "#65A30D" },
  { email: "participant10@example.com",        internal_id: "u10", name: "Aren",        initials: "AR", color: "#D946EF" },
  { email: "participant11@example.com",            internal_id: "u11", name: "Hussain",     initials: "HM", color: "#F97316" },
  { email: "participant12@example.com",     internal_id: "u12", name: "Moa",         initials: "ML", color: "#0EA5E9" },
  { email: "participant13@example.com",           internal_id: "u13", name: "Richard",     initials: "RC", color: "#A855F7" },
  { email: "participant14@example.com",              internal_id: "u14", name: "Meyi",        initials: "MT", color: "#14B8A6" },
  { email: "participant15@example.com",     internal_id: "u15", name: "Amrit",       initials: "AT", color: "#22C55E" },
  { email: "participant16@example.com",               internal_id: "u16", name: "Onen",        initials: "ON", color: "#3B82E8" },
  { email: "participant17@example.com",            internal_id: "u17", name: "Harshini",    initials: "HA", color: "#F43F5E" },
  { email: "participant18@example.com",            internal_id: "u18", name: "Prakul",      initials: "PK", color: "#FBBF24" },
  { email: "participant19@example.com",           internal_id: "u19", name: "Vijit",       initials: "VK", color: "#64748B" },
  { email: "participant20@example.com",           internal_id: "u20", name: "Kimzo",       initials: "KZ", color: "#E8523B" },
  { email: "participant21@example.com",                internal_id: "u21", name: "Max",         initials: "MX", color: "#7C3AED" },
  { email: "participant22@example.com",               internal_id: "u22", name: "Neha",        initials: "NH", color: "#059669" },
  { email: "participant23@example.com",   internal_id: "u23", name: "Longtilong",  initials: "LL", color: "#B45309" },
  { email: "participant24@example.com",       internal_id: "u24", name: "Sungtirong",  initials: "ST", color: "#0369A1" },
  { email: "participant25@example.com",              internal_id: "u25", name: "Panyu",       initials: "PY", color: "#84CC16" },
  { email: "participant26@example.com",              internal_id: "u26", name: "Esther",      initials: "ES", color: "#BE185D" },
  { email: "participant27@example.com",          internal_id: "u27", name: "Nathan",       initials: "NP", color: "#1E40AF" },
];

export function configByEmail(email) {
  if (!email) return null;
  return PARTICIPANT_CONFIG.find(p => p.email.toLowerCase() === email.trim().toLowerCase()) || null;
}
