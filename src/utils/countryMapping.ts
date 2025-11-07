/**
 * Country mapping utilities
 * Handles conversion between country codes and full names
 */

// Map full country names to ISO codes
export const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "UK",
  Canada: "CA",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  Spain: "ES",
  Italy: "IT",
  Japan: "JP",
  China: "CN",
  India: "IN",
  Brazil: "BR",
  Mexico: "MX",
  Netherlands: "NL",
  Sweden: "SE",
  Norway: "NO",
  Denmark: "DK",
  Finland: "FI",
  Portugal: "PT",
  Greece: "GR",
};

// Map ISO codes to full country names
export const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  US: "United States",
  UK: "United Kingdom",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  JP: "Japan",
  CN: "China",
  IN: "India",
  BR: "Brazil",
  MX: "Mexico",
  NL: "Netherlands",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  PT: "Portugal",
  GR: "Greece",
};

// Map language names to codes
export const LANGUAGE_NAME_TO_CODE: Record<string, string> = {
  English: "en",
  Spanish: "es",
  French: "fr",
  German: "de",
  Italian: "it",
  Portuguese: "pt",
  Dutch: "nl",
  Swedish: "sv",
  Norwegian: "no",
  Danish: "da",
  Finnish: "fi",
  Japanese: "ja",
  Chinese: "zh",
  Hindi: "hi",
};

// Map language codes to names
export const LANGUAGE_CODE_TO_NAME: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  ja: "Japanese",
  zh: "Chinese",
  hi: "Hindi",
};

/**
 * Convert country name to ISO code
 * @param name - Full country name (e.g., "Germany")
 * @returns ISO code (e.g., "DE") or the original name if not found
 */
export function getCountryCode(name: string | null | undefined): string {
  if (!name) return "";

  // If it's already a 2-letter code, return it
  if (name.length === 2 && COUNTRY_CODE_TO_NAME[name.toUpperCase()]) {
    return name.toUpperCase();
  }

  // Convert name to code
  return COUNTRY_NAME_TO_CODE[name] || name;
}

/**
 * Convert country code to full name
 * @param code - ISO code (e.g., "DE")
 * @returns Full country name (e.g., "Germany") or the original code if not found
 */
export function getCountryName(code: string | null | undefined): string {
  if (!code) return "";

  const upperCode = code.toUpperCase();
  return COUNTRY_CODE_TO_NAME[upperCode] || code;
}

/**
 * Convert language name to code
 * @param name - Full language name (e.g., "German")
 * @returns Language code (e.g., "de") or the original name if not found
 */
export function getLanguageCode(name: string | null | undefined): string {
  if (!name) return "";

  // If it's already a 2-letter code, return it lowercase
  if (name.length === 2 && LANGUAGE_CODE_TO_NAME[name.toLowerCase()]) {
    return name.toLowerCase();
  }

  // Convert name to code
  return LANGUAGE_NAME_TO_CODE[name] || name;
}

/**
 * Convert language code to full name
 * @param code - Language code (e.g., "de")
 * @returns Full language name (e.g., "German") or the original code if not found
 */
export function getLanguageName(code: string | null | undefined): string {
  if (!code) return "";

  const lowerCode = code.toLowerCase();
  return LANGUAGE_CODE_TO_NAME[lowerCode] || code;
}

/**
 * Convert array of language names to codes
 */
export function convertLanguagesToCodes(languages: string[]): string[] {
  return languages.map(getLanguageCode);
}

/**
 * Convert array of language codes to names
 */
export function convertLanguagesToNames(codes: string[]): string[] {
  return codes.map(getLanguageName);
}
