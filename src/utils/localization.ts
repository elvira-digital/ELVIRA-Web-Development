// Country code to full name mapping
const COUNTRY_NAMES: Record<string, string> = {
  // Europe
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  PT: "Portugal",
  GB: "United Kingdom",
  UK: "United Kingdom",
  IE: "Ireland",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  PL: "Poland",
  CZ: "Czech Republic",
  GR: "Greece",
  HU: "Hungary",
  RO: "Romania",
  BG: "Bulgaria",
  HR: "Croatia",
  SI: "Slovenia",
  SK: "Slovakia",
  LT: "Lithuania",
  LV: "Latvia",
  EE: "Estonia",
  LU: "Luxembourg",
  MT: "Malta",
  CY: "Cyprus",
  IS: "Iceland",

  // Americas
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
  BR: "Brazil",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  PE: "Peru",
  VE: "Venezuela",
  EC: "Ecuador",
  BO: "Bolivia",
  PY: "Paraguay",
  UY: "Uruguay",
  CR: "Costa Rica",
  PA: "Panama",
  GT: "Guatemala",
  CU: "Cuba",
  DO: "Dominican Republic",
  HN: "Honduras",
  NI: "Nicaragua",
  SV: "El Salvador",

  // Asia
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  IN: "India",
  TH: "Thailand",
  VN: "Vietnam",
  PH: "Philippines",
  ID: "Indonesia",
  MY: "Malaysia",
  SG: "Singapore",
  HK: "Hong Kong",
  TW: "Taiwan",
  PK: "Pakistan",
  BD: "Bangladesh",
  LK: "Sri Lanka",
  NP: "Nepal",
  KH: "Cambodia",
  LA: "Laos",
  MM: "Myanmar",
  MN: "Mongolia",

  // Middle East
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  IL: "Israel",
  TR: "Turkey",
  IR: "Iran",
  IQ: "Iraq",
  JO: "Jordan",
  LB: "Lebanon",
  KW: "Kuwait",
  QA: "Qatar",
  OM: "Oman",
  BH: "Bahrain",
  YE: "Yemen",

  // Africa
  ZA: "South Africa",
  EG: "Egypt",
  NG: "Nigeria",
  KE: "Kenya",
  MA: "Morocco",
  TN: "Tunisia",
  DZ: "Algeria",
  ET: "Ethiopia",
  GH: "Ghana",
  UG: "Uganda",
  TZ: "Tanzania",
  SN: "Senegal",
  CI: "Ivory Coast",
  CM: "Cameroon",
  AO: "Angola",
  MZ: "Mozambique",
  ZW: "Zimbabwe",
  BW: "Botswana",
  NA: "Namibia",

  // Oceania
  AU: "Australia",
  NZ: "New Zealand",
  FJ: "Fiji",
  PG: "Papua New Guinea",
  NC: "New Caledonia",
  PF: "French Polynesia",
};

// Language code to full name mapping
const LANGUAGE_NAMES: Record<string, string> = {
  // Major languages
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
  bn: "Bengali",
  pa: "Punjabi",
  te: "Telugu",
  mr: "Marathi",
  ta: "Tamil",
  ur: "Urdu",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",

  // European languages
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  pl: "Polish",
  cs: "Czech",
  el: "Greek",
  hu: "Hungarian",
  ro: "Romanian",
  bg: "Bulgarian",
  hr: "Croatian",
  sr: "Serbian",
  sk: "Slovak",
  sl: "Slovenian",
  lt: "Lithuanian",
  lv: "Latvian",
  et: "Estonian",
  uk: "Ukrainian",
  be: "Belarusian",

  // Other major languages
  tr: "Turkish",
  he: "Hebrew",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
  ms: "Malay",
  fa: "Persian",
  sw: "Swahili",
  am: "Amharic",
  yo: "Yoruba",
  zu: "Zulu",
  xh: "Xhosa",
  af: "Afrikaans",
  is: "Icelandic",
  ga: "Irish",
  cy: "Welsh",
  sq: "Albanian",
  mk: "Macedonian",
  bs: "Bosnian",
  mt: "Maltese",
  lb: "Luxembourgish",
};

/**
 * Convert country code to full country name
 * @param code - ISO 3166-1 alpha-2 country code (e.g., "DE", "US")
 * @returns Full country name or the original code if not found
 */
export function getCountryName(code: string | null | undefined): string {
  if (!code) return "N/A";
  const upperCode = code.toUpperCase();
  return COUNTRY_NAMES[upperCode] || code;
}

/**
 * Convert language code to full language name
 * @param code - ISO 639-1 language code (e.g., "en", "es", "de")
 * @returns Full language name or the original code if not found
 */
export function getLanguageName(code: string | null | undefined): string {
  if (!code) return "N/A";
  const lowerCode = code.toLowerCase();
  return LANGUAGE_NAMES[lowerCode] || code;
}
