/**
 * Demographics Types
 *
 * Types for user demographics, device information, and geographic data.
 */

/**
 * Geographic user data
 */
export interface GeographicData {
  country: string;
  countryCode?: string;
  users: number;
  sessions: number;
  percentage: number;
}

/**
 * City-level geographic data
 */
export interface CityData {
  city: string;
  country: string;
  users: number;
  sessions: number;
  percentage: number;
}

/**
 * Device category breakdown
 */
export interface DeviceData {
  category: "mobile" | "desktop" | "tablet";
  users: number;
  sessions: number;
  bounceRate: number;
  percentage: number;
}

/**
 * Browser information
 */
export interface BrowserData {
  browser: string;
  version?: string;
  users: number;
  sessions: number;
  percentage: number;
}

/**
 * Operating system data
 */
export interface OperatingSystemData {
  os: string;
  version?: string;
  users: number;
  sessions: number;
  percentage: number;
}

/**
 * Screen resolution data
 */
export interface ScreenResolution {
  resolution: string;
  users: number;
  percentage: number;
}

/**
 * Age group demographics (if available)
 */
export interface AgeGroup {
  ageRange: string;
  users: number;
  percentage: number;
}

/**
 * Gender demographics (if available)
 */
export interface GenderData {
  gender: "male" | "female" | "unknown";
  users: number;
  percentage: number;
}

/**
 * Interest categories (if available)
 */
export interface InterestCategory {
  category: string;
  subcategory?: string;
  users: number;
  percentage: number;
}

/**
 * Complete demographics report
 */
export interface DemographicsReport {
  countries: GeographicData[];
  cities: CityData[];
  devices: DeviceData[];
  browsers: BrowserData[];
  operatingSystems: OperatingSystemData[];
  screenResolutions: ScreenResolution[];
  ageGroups?: AgeGroup[];
  genderData?: GenderData[];
  interests?: InterestCategory[];
  totalUsers: number;
}
