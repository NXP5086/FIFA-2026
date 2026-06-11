// Tournament data for the FIFA World Cup 2026 prediction pool

export const USERS = [
  { id: "u1",  name: "Mrigank",    initials: "MS", color: "#DC2626" },
  { id: "u2",  name: "Pooja",      initials: "PJ", color: "#2DD4BF" },
  { id: "u3",  name: "Heril",      initials: "HS", color: "#06B6D4" },
  { id: "u4",  name: "Shefali",    initials: "SG", color: "#EC4899" },
  { id: "u5",  name: "Imtinok",    initials: "IP", color: "#8B5CF6" },
  { id: "u6",  name: "Tali",       initials: "TI", color: "#10A86C" },
  { id: "u7",  name: "Pura",       initials: "PU", color: "#F59E0B" },
  { id: "u8",  name: "Bivin",      initials: "BV", color: "#EF4444" },
  { id: "u9",  name: "Aosen",      initials: "AJ", color: "#65A30D" },
  { id: "u10", name: "Aren",       initials: "AR", color: "#D946EF" },
  { id: "u11", name: "Hussain",    initials: "HM", color: "#F97316" },
  { id: "u12", name: "Moa",        initials: "ML", color: "#0EA5E9" },
  { id: "u13", name: "Richard",    initials: "RC", color: "#A855F7" },
  { id: "u14", name: "Meyi",       initials: "MT", color: "#14B8A6" },
  { id: "u16", name: "Onen",       initials: "ON", color: "#3B82E8" },
  { id: "u17", name: "Harshini",   initials: "HA", color: "#F43F5E" },
  { id: "u18", name: "Prakul",     initials: "PK", color: "#FBBF24" },
  { id: "u20", name: "Kimzo",      initials: "KZ", color: "#E8523B" },
  { id: "u21", name: "Max",        initials: "MX", color: "#7C3AED" },
  { id: "u22", name: "Neha",       initials: "NH", color: "#059669" },
  { id: "u23", name: "Longtilong", initials: "LL", color: "#B45309" },
  { id: "u24", name: "Sungtirong", initials: "ST", color: "#0369A1" },
  { id: "u25", name: "Panyu",      initials: "PY", color: "#84CC16" },
  { id: "u26", name: "Esther",     initials: "ES", color: "#BE185D" },
  { id: "u27", name: "Nathan",     initials: "NP", color: "#1E40AF" },
  { id: "u28", name: "Medempok",   initials: "MP", color: "#C2410C" },
  { id: "u29", name: "Sangto",     initials: "SL", color: "#15803D" },
  { id: "u30", name: "Yash",       initials: "YK", color: "#6D28D9" },
  { id: "u31", name: "Shyam",      initials: "SH", color: "#0F766E" },
  { id: "u32", name: "Manna",      initials: "AD", color: "#CA8A04" },
  { id: "u33", name: "Maria",      initials: "MR", color: "#BE123C" },
  { id: "u34", name: "Lanu",       initials: "LA", color: "#1D4ED8" },
  { id: "u35", name: "Rupkiri",    initials: "RK", color: "#7E22CE" },
  { id: "u36", name: "Along",      initials: "AL", color: "#D97706" },
  { id: "u37", name: "Hivibo",     initials: "HI", color: "#0891B2" },
  { id: "u38", name: "Tam",        initials: "TT", color: "#B91C1C" },
  { id: "u39", name: "Aarono",     initials: "AK", color: "#16A34A" },
  { id: "u40", name: "Tamé",       initials: "TB", color: "#9333EA" },
  { id: "u41", name: "Sunep",      initials: "SJ", color: "#EA580C" },
  { id: "u42", name: "Inovi",      initials: "IS", color: "#0284C7" },
  { id: "u43", name: "Hibuka",     initials: "HB", color: "#E11D48" },
  { id: "u44", name: "Shisa",      initials: "SS", color: "#6366F1" },
  { id: "u45", name: "Moameren",   initials: "MI", color: "#0D9488" },
  { id: "u47", name: "Aien",       initials: "AC", color: "#4F46E5" },
  { id: "u49", name: "Chuba",      initials: "CG", color: "#9D174D" },
  { id: "u51", name: "Rajat",      initials: "RT", color: "#78350F" },
  { id: "u52", name: "Rahul",      initials: "RS", color: "#374151" },
  { id: "u53", name: "Edi",        initials: "EI", color: "#713F12" },
  { id: "u54", name: "Shreyas",   initials: "SY", color: "#F472B6" },
];

const T = (code, name, c1, c2, c3) => ({ code, name, c1, c2, c3: c3 || c2 });

export const TEAMS = {
  MEX: T("MEX", "Mexico", "#006847", "#FFFFFF", "#CE1126"),
  CAN: T("CAN", "Canada", "#FF0000", "#FFFFFF", "#FF0000"),
  USA: T("USA", "United States", "#3C3B6E", "#FFFFFF", "#B22234"),
  ARG: T("ARG", "Argentina", "#74ACDF", "#FFFFFF", "#74ACDF"),
  BRA: T("BRA", "Brazil", "#009C3B", "#FFDF00", "#002776"),
  FRA: T("FRA", "France", "#0055A4", "#FFFFFF", "#EF4135"),
  ENG: T("ENG", "England", "#FFFFFF", "#CE1124", "#FFFFFF"),
  ESP: T("ESP", "Spain", "#AA151B", "#F1BF00", "#AA151B"),
  GER: T("GER", "Germany", "#000000", "#DD0000", "#FFCE00"),
  POR: T("POR", "Portugal", "#006600", "#FF0000", "#FFFF00"),
  NED: T("NED", "Netherlands", "#AE1C28", "#FFFFFF", "#21468B"),
  BEL: T("BEL", "Belgium", "#000000", "#FAE042", "#ED2939"),
  CRO: T("CRO", "Croatia", "#FF0000", "#FFFFFF", "#171796"),
  URU: T("URU", "Uruguay", "#7CB9E8", "#FFFFFF", "#FCD116"),
  JPN: T("JPN", "Japan", "#FFFFFF", "#BC002D", "#FFFFFF"),
  KOR: T("KOR", "Korea Rep.", "#FFFFFF", "#CD2E3A", "#0047A0"),
  AUS: T("AUS", "Australia", "#012169", "#FFFFFF", "#E4002B"),
  MAR: T("MAR", "Morocco", "#C1272D", "#006233", "#C1272D"),
  SEN: T("SEN", "Senegal", "#00853F", "#FDEF42", "#E31B23"),
  EGY: T("EGY", "Egypt", "#CE1126", "#FFFFFF", "#000000"),
  GHA: T("GHA", "Ghana", "#CE1126", "#FCD116", "#006B3F"),
  CIV: T("CIV", "Ivory Coast", "#FF8200", "#FFFFFF", "#009A44"),
  IRN: T("IRN", "Iran", "#239F40", "#FFFFFF", "#DA0000"),
  SAU: T("SAU", "Saudi Arabia", "#006C35", "#FFFFFF", "#006C35"),
  QAT: T("QAT", "Qatar", "#8A1538", "#FFFFFF", "#8A1538"),
  SUI: T("SUI", "Switzerland", "#FF0000", "#FFFFFF", "#FF0000"),
  ECU: T("ECU", "Ecuador", "#FFD100", "#0F47AF", "#DE2010"),
  COL: T("COL", "Colombia", "#FCD116", "#003893", "#CE1126"),
  NZL: T("NZL", "New Zealand", "#000000", "#FFFFFF", "#012169"),
  NOR: T("NOR", "Norway", "#BA0C2F", "#FFFFFF", "#00205B"),
  TUN: T("TUN", "Tunisia", "#E70013", "#FFFFFF", "#E70013"),
  RSA: T("RSA", "South Africa", "#007749", "#FFB81C", "#000000"),
  CZE: T("CZE", "Czechia", "#11457E", "#FFFFFF", "#D7141A"),
  BIH: T("BIH", "Bosnia & Herzegovina", "#002F6C", "#FFD700", "#FFFFFF"),
  SCO: T("SCO", "Scotland", "#0065BD", "#FFFFFF", "#0065BD"),
  HAI: T("HAI", "Haiti", "#00209F", "#D21034", "#00209F"),
  PAR: T("PAR", "Paraguay", "#D52B1E", "#FFFFFF", "#0038A8"),
  TUR: T("TUR", "Türkiye", "#E30A17", "#FFFFFF", "#E30A17"),
  CUW: T("CUW", "Curaçao", "#012A87", "#FFE15A", "#012A87"),
  SWE: T("SWE", "Sweden", "#006AA7", "#FECC00", "#006AA7"),
  CPV: T("CPV", "Cape Verde", "#003893", "#FFFFFF", "#CF2027"),
  IRQ: T("IRQ", "Iraq", "#CE1126", "#FFFFFF", "#000000"),
  AUT: T("AUT", "Austria", "#ED2939", "#FFFFFF", "#ED2939"),
  ALG: T("ALG", "Algeria", "#006633", "#FFFFFF", "#D21034"),
  JOR: T("JOR", "Jordan", "#000000", "#FFFFFF", "#007A3D"),
  UZB: T("UZB", "Uzbekistan", "#1EB53A", "#FFFFFF", "#0099B5"),
  COD: T("COD", "DR Congo", "#007FFF", "#F7D618", "#CE1021"),
  PAN: T("PAN", "Panama", "#005AA7", "#FFFFFF", "#D21034"),
  // Knockout placeholder (for "TBD" slots until groups finish)
  TBD: T("TBD", "To Be Determined", "#C8C2B5", "#E3DFD6", "#C8C2B5")
};

export const TEAM_FLAGS = {
  MEX: "🇲🇽", CAN: "🇨🇦", USA: "🇺🇸", ARG: "🇦🇷", BRA: "🇧🇷",
  FRA: "🇫🇷", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ESP: "🇪🇸", GER: "🇩🇪", POR: "🇵🇹",
  NED: "🇳🇱", BEL: "🇧🇪", CRO: "🇭🇷", URU: "🇺🇾", JPN: "🇯🇵",
  KOR: "🇰🇷", AUS: "🇦🇺", MAR: "🇲🇦", SEN: "🇸🇳", EGY: "🇪🇬",
  GHA: "🇬🇭", CIV: "🇨🇮", IRN: "🇮🇷", SAU: "🇸🇦", QAT: "🇶🇦",
  SUI: "🇨🇭", ECU: "🇪🇨", COL: "🇨🇴", NZL: "🇳🇿", NOR: "🇳🇴",
  TUN: "🇹🇳", RSA: "🇿🇦", CZE: "🇨🇿", BIH: "🇧🇦", SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  HAI: "🇭🇹", PAR: "🇵🇾", TUR: "🇹🇷", CUW: "🇨🇼", SWE: "🇸🇪",
  CPV: "🇨🇻", IRQ: "🇮🇶", AUT: "🇦🇹", ALG: "🇩🇿", JOR: "🇯🇴",
  UZB: "🇺🇿", COD: "🇨🇩", PAN: "🇵🇦",
};

// 2026 World Cup — official group draw (December 5, 2025, Kennedy Center)
export const GROUPS = {
  A: ["MEX", "KOR", "RSA", "CZE"],
  B: ["CAN", "SUI", "QAT", "BIH"],
  C: ["BRA", "MAR", "SCO", "HAI"],
  D: ["USA", "PAR", "AUS", "TUR"],
  E: ["GER", "ECU", "CIV", "CUW"],
  F: ["NED", "JPN", "TUN", "SWE"],
  G: ["BEL", "IRN", "EGY", "NZL"],
  H: ["ESP", "URU", "SAU", "CPV"],
  I: ["FRA", "SEN", "NOR", "IRQ"],
  J: ["ARG", "AUT", "ALG", "JOR"],
  K: ["POR", "COL", "UZB", "COD"],
  L: ["ENG", "CRO", "PAN", "GHA"]
};

export const VENUES = {
  AZT: { city: "Mexico City", stadium: "Estadio Azteca" },
  MET: { city: "New York/New Jersey", stadium: "MetLife Stadium" },
  SOF: { city: "Los Angeles", stadium: "SoFi Stadium" },
  ATT: { city: "Dallas", stadium: "AT&T Stadium" },
  GIL: { city: "Houston", stadium: "NRG Stadium" },
  MBS: { city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
  HRD: { city: "Miami", stadium: "Hard Rock Stadium" },
  LIN: { city: "Philadelphia", stadium: "Lincoln Financial Field" },
  LEV: { city: "San Francisco Bay Area", stadium: "Levi's Stadium" },
  LUM: { city: "Seattle", stadium: "Lumen Field" },
  ARH: { city: "Kansas City", stadium: "Arrowhead Stadium" },
  BMO: { city: "Toronto", stadium: "BMO Field" },
  BCP: { city: "Vancouver", stadium: "BC Place" },
  AKR: { city: "Guadalajara", stadium: "Estadio Akron" },
  BBV: { city: "Monterrey", stadium: "Estadio BBVA" },
  GIS: { city: "Boston", stadium: "Gillette Stadium" }
};

// Build a UTC ISO date from an ET clock time + date string.
// June is EDT (UTC-4). "next" flag rolls the date forward 1 day for late-night ET times
// (e.g. midnight, 10pm ET converted to next-day UTC).
function et(dateStr, hour, min, next) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + (next ? 1 : 0), hour + 4, min || 0, 0));
  return utc.toISOString();
}

// 2026 FIFA World Cup — Official 72 group-stage fixtures
// Source: FIFA, official match schedule released December 6, 2025
// Time conversions: all ET kickoffs → UTC for IST display
const GROUP_FIXTURES = [
  // GROUP A
  { g: "A", md: 1, date: "2026-06-11", h: "MEX", a: "RSA", venue: "AZT", utc: et("2026-06-11", 15, 0) },
  { g: "A", md: 1, date: "2026-06-11", h: "KOR", a: "CZE", venue: "AKR", utc: et("2026-06-11", 22, 0) },
  { g: "A", md: 2, date: "2026-06-18", h: "CZE", a: "RSA", venue: "MBS", utc: et("2026-06-18", 12, 0) },
  { g: "A", md: 2, date: "2026-06-18", h: "MEX", a: "KOR", venue: "AKR", utc: et("2026-06-18", 21, 0) },
  { g: "A", md: 3, date: "2026-06-24", h: "CZE", a: "MEX", venue: "AZT", utc: et("2026-06-24", 21, 0) },
  { g: "A", md: 3, date: "2026-06-24", h: "RSA", a: "KOR", venue: "BBV", utc: et("2026-06-24", 21, 0) },
  // GROUP B
  { g: "B", md: 1, date: "2026-06-12", h: "CAN", a: "BIH", venue: "BMO", utc: et("2026-06-12", 15, 0) },
  { g: "B", md: 1, date: "2026-06-13", h: "QAT", a: "SUI", venue: "LEV", utc: et("2026-06-13", 15, 0) },
  { g: "B", md: 2, date: "2026-06-18", h: "SUI", a: "BIH", venue: "SOF", utc: et("2026-06-18", 15, 0) },
  { g: "B", md: 2, date: "2026-06-18", h: "CAN", a: "QAT", venue: "BCP", utc: et("2026-06-18", 18, 0) },
  { g: "B", md: 3, date: "2026-06-24", h: "SUI", a: "CAN", venue: "BCP", utc: et("2026-06-24", 15, 0) },
  { g: "B", md: 3, date: "2026-06-24", h: "BIH", a: "QAT", venue: "LUM", utc: et("2026-06-24", 15, 0) },
  // GROUP C
  { g: "C", md: 1, date: "2026-06-13", h: "BRA", a: "MAR", venue: "MET", utc: et("2026-06-13", 18, 0) },
  { g: "C", md: 1, date: "2026-06-13", h: "HAI", a: "SCO", venue: "GIS", utc: et("2026-06-13", 21, 0) },
  { g: "C", md: 2, date: "2026-06-19", h: "SCO", a: "MAR", venue: "GIS", utc: et("2026-06-19", 18, 0) },
  { g: "C", md: 2, date: "2026-06-19", h: "BRA", a: "HAI", venue: "LIN", utc: et("2026-06-19", 21, 0) },
  { g: "C", md: 3, date: "2026-06-24", h: "SCO", a: "BRA", venue: "HRD", utc: et("2026-06-24", 18, 0) },
  { g: "C", md: 3, date: "2026-06-24", h: "MAR", a: "HAI", venue: "MBS", utc: et("2026-06-24", 18, 0) },
  // GROUP D
  { g: "D", md: 1, date: "2026-06-12", h: "USA", a: "PAR", venue: "SOF", utc: et("2026-06-12", 21, 0) },
  { g: "D", md: 1, date: "2026-06-13", h: "AUS", a: "TUR", venue: "BCP", utc: et("2026-06-13", 0, 0, true) },
  { g: "D", md: 2, date: "2026-06-19", h: "USA", a: "AUS", venue: "LUM", utc: et("2026-06-19", 15, 0) },
  { g: "D", md: 2, date: "2026-06-19", h: "TUR", a: "PAR", venue: "LEV", utc: et("2026-06-19", 0, 0, true) },
  { g: "D", md: 3, date: "2026-06-25", h: "TUR", a: "USA", venue: "SOF", utc: et("2026-06-25", 22, 0) },
  { g: "D", md: 3, date: "2026-06-25", h: "PAR", a: "AUS", venue: "LEV", utc: et("2026-06-25", 22, 0) },
  // GROUP E
  { g: "E", md: 1, date: "2026-06-14", h: "GER", a: "CUW", venue: "GIL", utc: et("2026-06-14", 13, 0) },
  { g: "E", md: 1, date: "2026-06-14", h: "CIV", a: "ECU", venue: "LIN", utc: et("2026-06-14", 19, 0) },
  { g: "E", md: 2, date: "2026-06-20", h: "GER", a: "CIV", venue: "BMO", utc: et("2026-06-20", 16, 0) },
  { g: "E", md: 2, date: "2026-06-20", h: "ECU", a: "CUW", venue: "ARH", utc: et("2026-06-20", 20, 0) },
  { g: "E", md: 3, date: "2026-06-25", h: "ECU", a: "GER", venue: "MET", utc: et("2026-06-25", 16, 0) },
  { g: "E", md: 3, date: "2026-06-25", h: "CUW", a: "CIV", venue: "LIN", utc: et("2026-06-25", 16, 0) },
  // GROUP F
  { g: "F", md: 1, date: "2026-06-14", h: "NED", a: "JPN", venue: "ATT", utc: et("2026-06-14", 16, 0) },
  { g: "F", md: 1, date: "2026-06-14", h: "SWE", a: "TUN", venue: "BBV", utc: et("2026-06-14", 22, 0) },
  { g: "F", md: 2, date: "2026-06-20", h: "NED", a: "SWE", venue: "GIL", utc: et("2026-06-20", 13, 0) },
  { g: "F", md: 2, date: "2026-06-20", h: "TUN", a: "JPN", venue: "BBV", utc: et("2026-06-20", 0, 0, true) },
  { g: "F", md: 3, date: "2026-06-25", h: "JPN", a: "SWE", venue: "ATT", utc: et("2026-06-25", 19, 0) },
  { g: "F", md: 3, date: "2026-06-25", h: "TUN", a: "NED", venue: "ARH", utc: et("2026-06-25", 19, 0) },
  // GROUP G
  { g: "G", md: 1, date: "2026-06-15", h: "BEL", a: "EGY", venue: "LUM", utc: et("2026-06-15", 15, 0) },
  { g: "G", md: 1, date: "2026-06-15", h: "IRN", a: "NZL", venue: "SOF", utc: et("2026-06-15", 21, 0) },
  { g: "G", md: 2, date: "2026-06-21", h: "BEL", a: "IRN", venue: "SOF", utc: et("2026-06-21", 15, 0) },
  { g: "G", md: 2, date: "2026-06-21", h: "NZL", a: "EGY", venue: "BCP", utc: et("2026-06-21", 21, 0) },
  { g: "G", md: 3, date: "2026-06-26", h: "EGY", a: "IRN", venue: "LUM", utc: et("2026-06-26", 23, 0) },
  { g: "G", md: 3, date: "2026-06-26", h: "NZL", a: "BEL", venue: "BCP", utc: et("2026-06-26", 23, 0) },
  // GROUP H
  { g: "H", md: 1, date: "2026-06-15", h: "ESP", a: "CPV", venue: "MBS", utc: et("2026-06-15", 12, 0) },
  { g: "H", md: 1, date: "2026-06-15", h: "SAU", a: "URU", venue: "HRD", utc: et("2026-06-15", 18, 0) },
  { g: "H", md: 2, date: "2026-06-21", h: "ESP", a: "SAU", venue: "MBS", utc: et("2026-06-21", 12, 0) },
  { g: "H", md: 2, date: "2026-06-21", h: "URU", a: "CPV", venue: "HRD", utc: et("2026-06-21", 18, 0) },
  { g: "H", md: 3, date: "2026-06-26", h: "CPV", a: "SAU", venue: "GIL", utc: et("2026-06-26", 20, 0) },
  { g: "H", md: 3, date: "2026-06-26", h: "URU", a: "ESP", venue: "AKR", utc: et("2026-06-26", 20, 0) },
  // GROUP I
  { g: "I", md: 1, date: "2026-06-16", h: "FRA", a: "SEN", venue: "MET", utc: et("2026-06-16", 15, 0) },
  { g: "I", md: 1, date: "2026-06-16", h: "IRQ", a: "NOR", venue: "GIS", utc: et("2026-06-16", 18, 0) },
  { g: "I", md: 2, date: "2026-06-22", h: "FRA", a: "IRQ", venue: "LIN", utc: et("2026-06-22", 17, 0) },
  { g: "I", md: 2, date: "2026-06-22", h: "NOR", a: "SEN", venue: "MET", utc: et("2026-06-22", 20, 0) },
  { g: "I", md: 3, date: "2026-06-26", h: "NOR", a: "FRA", venue: "GIS", utc: et("2026-06-26", 15, 0) },
  { g: "I", md: 3, date: "2026-06-26", h: "SEN", a: "IRQ", venue: "BMO", utc: et("2026-06-26", 15, 0) },
  // GROUP J
  { g: "J", md: 1, date: "2026-06-16", h: "ARG", a: "ALG", venue: "ARH", utc: et("2026-06-16", 21, 0) },
  { g: "J", md: 1, date: "2026-06-17", h: "AUT", a: "JOR", venue: "LEV", utc: et("2026-06-17", 0, 0, true) },
  { g: "J", md: 2, date: "2026-06-22", h: "ARG", a: "AUT", venue: "ATT", utc: et("2026-06-22", 13, 0) },
  { g: "J", md: 2, date: "2026-06-22", h: "JOR", a: "ALG", venue: "LEV", utc: et("2026-06-22", 23, 0) },
  { g: "J", md: 3, date: "2026-06-27", h: "ALG", a: "AUT", venue: "ARH", utc: et("2026-06-27", 22, 0) },
  { g: "J", md: 3, date: "2026-06-27", h: "JOR", a: "ARG", venue: "ATT", utc: et("2026-06-27", 22, 0) },
  // GROUP K
  { g: "K", md: 1, date: "2026-06-17", h: "POR", a: "COD", venue: "GIL", utc: et("2026-06-17", 13, 0) },
  { g: "K", md: 1, date: "2026-06-17", h: "UZB", a: "COL", venue: "AZT", utc: et("2026-06-17", 22, 0) },
  { g: "K", md: 2, date: "2026-06-23", h: "POR", a: "UZB", venue: "GIL", utc: et("2026-06-23", 13, 0) },
  { g: "K", md: 2, date: "2026-06-23", h: "COL", a: "COD", venue: "AKR", utc: et("2026-06-23", 22, 0) },
  { g: "K", md: 3, date: "2026-06-27", h: "COL", a: "POR", venue: "HRD", utc: et("2026-06-27", 19, 30) },
  { g: "K", md: 3, date: "2026-06-27", h: "COD", a: "UZB", venue: "MBS", utc: et("2026-06-27", 19, 30) },
  // GROUP L
  { g: "L", md: 1, date: "2026-06-17", h: "ENG", a: "CRO", venue: "ATT", utc: et("2026-06-17", 16, 0) },
  { g: "L", md: 1, date: "2026-06-17", h: "GHA", a: "PAN", venue: "BMO", utc: et("2026-06-17", 19, 0) },
  { g: "L", md: 2, date: "2026-06-23", h: "ENG", a: "GHA", venue: "GIS", utc: et("2026-06-23", 16, 0) },
  { g: "L", md: 2, date: "2026-06-23", h: "PAN", a: "CRO", venue: "BMO", utc: et("2026-06-23", 19, 0) },
  { g: "L", md: 3, date: "2026-06-27", h: "PAN", a: "ENG", venue: "MET", utc: et("2026-06-27", 17, 0) },
  { g: "L", md: 3, date: "2026-06-27", h: "CRO", a: "GHA", venue: "LIN", utc: et("2026-06-27", 17, 0) }
];

// Knockout matches — official 2026 schedule (match numbers 73–104)
// Teams are TBD until group stage finishes; we show stage descriptor as the team label.
// Format: { num, stage, date, utc, venue, homeLabel, awayLabel, home (TBD if unknown), away }
const KO_FIXTURES = [
  // ===== ROUND OF 32 (Match 73–88) =====
  { num: 73, stage: "R32", utc: et("2026-06-28", 15, 0), venue: "SOF", homeLabel: "Runner-up A", awayLabel: "Runner-up B" },
  { num: 74, stage: "R32", utc: et("2026-06-29", 16, 30), venue: "GIS", homeLabel: "Winner E",   awayLabel: "3rd A/B/C/D/F" },
  { num: 75, stage: "R32", utc: et("2026-06-29", 21, 0), venue: "BBV", homeLabel: "Winner F",   awayLabel: "Runner-up C" },
  { num: 76, stage: "R32", utc: et("2026-06-29", 13, 0), venue: "GIL", homeLabel: "Winner C",   awayLabel: "Runner-up F" },
  { num: 77, stage: "R32", utc: et("2026-06-30", 17, 0), venue: "MET", homeLabel: "Winner I",   awayLabel: "3rd C/D/F/G/H" },
  { num: 78, stage: "R32", utc: et("2026-06-30", 13, 0), venue: "ATT", homeLabel: "Runner-up E", awayLabel: "Runner-up I" },
  { num: 79, stage: "R32", utc: et("2026-06-30", 21, 0), venue: "AZT", homeLabel: "Winner A",   awayLabel: "3rd C/E/F/H/I" },
  { num: 80, stage: "R32", utc: et("2026-07-01", 12, 0), venue: "MBS", homeLabel: "Winner L",   awayLabel: "3rd E/H/I/J/K" },
  { num: 81, stage: "R32", utc: et("2026-07-01", 20, 0), venue: "LEV", homeLabel: "Winner D",   awayLabel: "3rd B/E/F/I/J" },
  { num: 82, stage: "R32", utc: et("2026-07-01", 16, 0), venue: "LUM", homeLabel: "Winner G",   awayLabel: "3rd A/E/H/I/J" },
  { num: 83, stage: "R32", utc: et("2026-07-02", 19, 0), venue: "BMO", homeLabel: "Runner-up K", awayLabel: "Runner-up L" },
  { num: 84, stage: "R32", utc: et("2026-07-02", 15, 0), venue: "SOF", homeLabel: "Winner H",   awayLabel: "Runner-up J" },
  { num: 85, stage: "R32", utc: et("2026-07-02", 23, 0), venue: "BCP", homeLabel: "Winner B",   awayLabel: "3rd E/F/G/I/J" },
  { num: 86, stage: "R32", utc: et("2026-07-03", 18, 0), venue: "HRD", homeLabel: "Winner J",   awayLabel: "Runner-up H" },
  { num: 87, stage: "R32", utc: et("2026-07-03", 21, 30), venue: "ARH", homeLabel: "Winner K",   awayLabel: "3rd D/E/I/J/L" },
  { num: 88, stage: "R32", utc: et("2026-07-03", 14, 0), venue: "ATT", homeLabel: "Runner-up D", awayLabel: "Runner-up G" },
  // ===== ROUND OF 16 (Match 89–96) =====
  { num: 89, stage: "R16", utc: et("2026-07-04", 17, 0), venue: "LIN", homeLabel: "Winner M74",  awayLabel: "Winner M77" },
  { num: 90, stage: "R16", utc: et("2026-07-04", 13, 0), venue: "GIL", homeLabel: "Winner M73",  awayLabel: "Winner M75" },
  { num: 91, stage: "R16", utc: et("2026-07-05", 16, 0), venue: "MET", homeLabel: "Winner M76",  awayLabel: "Winner M78" },
  { num: 92, stage: "R16", utc: et("2026-07-05", 20, 0), venue: "AZT", homeLabel: "Winner M79",  awayLabel: "Winner M80" },
  { num: 93, stage: "R16", utc: et("2026-07-06", 15, 0), venue: "ATT", homeLabel: "Winner M83",  awayLabel: "Winner M84" },
  { num: 94, stage: "R16", utc: et("2026-07-06", 20, 0), venue: "LUM", homeLabel: "Winner M81",  awayLabel: "Winner M82" },
  { num: 95, stage: "R16", utc: et("2026-07-07", 12, 0), venue: "MBS", homeLabel: "Winner M86",  awayLabel: "Winner M88" },
  { num: 96, stage: "R16", utc: et("2026-07-07", 16, 0), venue: "BCP", homeLabel: "Winner M85",  awayLabel: "Winner M87" },
  // ===== QUARTER-FINALS (Match 97–100) =====
  { num: 97, stage: "QF", utc: et("2026-07-09", 16, 0), venue: "GIS", homeLabel: "Winner M89",  awayLabel: "Winner M90" },
  { num: 98, stage: "QF", utc: et("2026-07-10", 16, 0), venue: "MET", homeLabel: "Winner M91",  awayLabel: "Winner M92" },
  { num: 99, stage: "QF", utc: et("2026-07-11", 12, 0), venue: "MBS", homeLabel: "Winner M93",  awayLabel: "Winner M94" },
  { num:100, stage: "QF", utc: et("2026-07-11", 16, 0), venue: "HRD", homeLabel: "Winner M95",  awayLabel: "Winner M96" },
  // ===== SEMI-FINALS (Match 101–102) =====
  { num:101, stage: "SF", utc: et("2026-07-14", 15, 0), venue: "ATT", homeLabel: "Winner M97",  awayLabel: "Winner M98" },
  { num:102, stage: "SF", utc: et("2026-07-15", 15, 0), venue: "ATT", homeLabel: "Winner M99",  awayLabel: "Winner M100" },
  // ===== THIRD-PLACE PLAY-OFF (Match 103) =====
  { num:103, stage: "3RD", utc: et("2026-07-18", 15, 0), venue: "HRD", homeLabel: "Loser M101", awayLabel: "Loser M102" },
  // ===== FINAL (Match 104) — MetLife Stadium, NJ, July 19 =====
  { num:104, stage: "F", utc: et("2026-07-19", 15, 0), venue: "MET", homeLabel: "Winner M101", awayLabel: "Winner M102" }
];

export const STAGE_LABELS = {
  GROUP: "Group Stage",
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  "3RD": "Third-Place Play-off",
  F: "Final"
};

function genMatches() {
  const matches = [];
  GROUP_FIXTURES.forEach((f, i) => {
    matches.push({
      id: `G${String(i + 1).padStart(2, "0")}`,
      stage: "GROUP",
      group: f.g,
      matchday: f.md,
      date: f.utc,
      venue: f.venue,
      home: f.h,
      away: f.a,
      result: null,
      live: null
    });
  });
  KO_FIXTURES.forEach((f) => {
    matches.push({
      id: `M${f.num}`,
      stage: f.stage,
      stageLabel: STAGE_LABELS[f.stage] || f.stage,
      matchNum: f.num,
      group: null,
      matchday: null,
      date: f.utc,
      venue: f.venue,
      home: "TBD",
      away: "TBD",
      homeLabel: f.homeLabel,
      awayLabel: f.awayLabel,
      result: null,
      live: null
    });
  });
  return matches;
}

export const MATCHES = genMatches();

// Seed predictions: cleared per user request — everyone starts with zero picks.
export const SEED_PREDICTIONS = {};

// Scoring (group stage):
//   +3 pts — correct outcome (right winner, or a draw correctly predicted)
//   +2 pts — exact goal score (bonus on top of outcome)
export const scorePrediction = function (pred, result) {
  if (!pred || !result) return null;
  let pts = 0;
  const tags = [];
  const predOut = Math.sign(pred.home - pred.away);
  const resOut = Math.sign(result[0] - result[1]);
  if (predOut === resOut) { pts += 3; tags.push("OUTCOME"); }
  if (pred.home === result[0] && pred.away === result[1]) {
    pts += 2; tags.push("EXACT");
  }
  return { pts, tags };
};

// Scoring (knockout stage):
//   +5 pts — correct winner
//   +2 pts — correct ending stage (NT/ET/PENS)
//   +2 pts — correct score AND correct ending stage (additional bonus)
//
// No draws allowed: a knockout pick must have a winner (home !== away).
// PENALTIES: when ending = "PENS", the score entered IS the shootout score
// (e.g. 3–5). Only that shootout score is considered for points — the
// match-time scoreline (e.g. 1–1 after extra time) is irrelevant. So a result
// of {score:[3,5], ending:"PENS"} is scored against the predicted [3,5]/PENS,
// nothing else.
export const scoreKnockoutPrediction = function (pred, result) {
  if (!pred || !result) return null;
  let pts = 0;
  const tags = [];
  const winnerOf = (h, a) => h > a ? "home" : a > h ? "away" : null;
  const predWinner = winnerOf(pred.home, pred.away);
  const resWinner = winnerOf(result.score[0], result.score[1]);
  if (predWinner && predWinner === resWinner) { pts += 5; tags.push("WINNER"); }
  if (pred.ending === result.ending) { pts += 2; tags.push("STAGE"); }
  if (
    pred.home === result.score[0] &&
    pred.away === result.score[1] &&
    pred.ending === result.ending
  ) { pts += 2; tags.push("EXACT_STAGE"); }
  return { pts, tags };
};

export const isKnockout = (m) => m.stage && m.stage !== "GROUP";

export const ENDING_LABELS = {
  NT: "Normal Time",
  ET: "Extra Time",
  PENS: "Penalties"
};

// ============================================================
// Auto-lock windows
// Predictions for a group of matches lock 2 hours before the
// first kickoff in that group. Awards lock with the semi-finals.
// ============================================================
function firstKickoff(predicate) {
  const ms = MATCHES.filter(predicate).map(m => new Date(m.date).getTime());
  return ms.length ? Math.min(...ms) : null;
}
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export const LOCK_WINDOWS = (function () {
  const md23First  = firstKickoff(m => m.stage === "GROUP" && m.matchday === 2);
  const r32First   = firstKickoff(m => m.stage === "R32");
  const r16First   = firstKickoff(m => m.stage === "R16");
  const qfFirst    = firstKickoff(m => m.stage === "QF");
  const sfFirst    = firstKickoff(m => m.stage === "SF");
  const tpFirst    = firstKickoff(m => m.stage === "3RD");
  return {
    MD1:    new Date("2026-06-11T19:30:00Z").getTime(), // 1:00 AM IST June 12
    MD23:   md23First  ? md23First  - TWO_HOURS_MS : null,
    R32:    r32First   ? r32First   - TWO_HOURS_MS : null,
    R16:    r16First   ? r16First   - TWO_HOURS_MS : null,
    QF:     qfFirst    ? qfFirst    - TWO_HOURS_MS : null,
    SF:     sfFirst    ? sfFirst    - TWO_HOURS_MS : null,
    F3RD:   tpFirst    ? tpFirst    - TWO_HOURS_MS : null,
    AWARDS: sfFirst    ? sfFirst    - TWO_HOURS_MS : null
  };
})();

// Resolve which lock window applies to a given match
export const lockKeyForMatch = function (match) {
  if (match.stage === "GROUP") return match.matchday === 1 ? "MD1" : "MD23";
  if (match.stage === "R32") return "R32";
  if (match.stage === "R16") return "R16";
  if (match.stage === "QF")  return "QF";
  if (match.stage === "SF")  return "SF";
  if (match.stage === "3RD" || match.stage === "F") return "F3RD";
  return null;
};

export const isMatchLocked = function (match, nowMs) {
  const key = lockKeyForMatch(match);
  if (!key) return false;
  const lockAt = LOCK_WINDOWS[key];
  if (lockAt == null) return false;
  return (nowMs || Date.now()) >= lockAt;
};

export const isAwardsLocked = function (nowMs) {
  const lockAt = LOCK_WINDOWS.AWARDS;
  if (lockAt == null) return false;
  return (nowMs || Date.now()) >= lockAt;
};

export const LOCK_GROUP_LABELS = {
  MD1:    "Matchday 1",
  MD23:   "Matchday 2 & 3",
  R32:    "Round of 32",
  R16:    "Round of 16",
  QF:     "Quarter-finals",
  SF:     "Semi-finals",
  F3RD:   "Third-Place & Final",
  AWARDS: "Tournament Awards"
};

// Tournament-end individual awards.
// +5 pts for each correct prediction once the official winner is announced.
export const AWARDS = [
  {
    id: "golden_ball",
    name: "Golden Ball",
    subtitle: "Best player of the tournament",
    hint: "e.g. Lionel Messi (ARG)",
    inputType: "player"
  },
  {
    id: "golden_boot",
    name: "Golden Boot",
    subtitle: "Top goalscorer",
    hint: "e.g. Kylian Mbappé (FRA)",
    inputType: "player"
  },
  {
    id: "golden_glove",
    name: "Golden Glove",
    subtitle: "Best goalkeeper",
    hint: "e.g. Emiliano Martínez (ARG)",
    inputType: "player"
  },
  {
    id: "young_player",
    name: "Best Young Player",
    subtitle: "Top player aged 21 or under",
    hint: "e.g. Lamine Yamal (ESP)",
    inputType: "player"
  },
  {
    id: "fair_play",
    name: "FIFA Fair Play Award",
    subtitle: "Team with the best fair-play record",
    hint: "e.g. Japan",
    inputType: "team"
  }
];

// Official award winners — null until results are announced.
// When known, set: AWARD_RESULTS[id] = { winner: "Exact name" };
export const AWARD_RESULTS = {
  golden_ball: null,
  golden_boot: null,
  golden_glove: null,
  young_player: null,
  fair_play: null
};

// Award scoring — +5 pts per correct prediction.
// Comparison is case-insensitive and whitespace-tolerant.
export const AWARD_POINTS = 5;
export const scoreAwardPrediction = function (pred, winner) {
  if (!pred || !winner) return 0;
  const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, " ");
  return norm(pred) === norm(winner) ? AWARD_POINTS : 0;
};
