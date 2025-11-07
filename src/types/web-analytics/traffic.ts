/**
 * Traffic Sources Types
 *
 * Types for analytics data related to traffic sources, channels, and referrals.
 */

/**
 * Traffic source data
 */
export interface TrafficSource {
  source: string;
  medium: string;
  campaign?: string;
  users: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  percentage: number;
}

/**
 * Simplified traffic source for charts
 */
export interface SimpleTrafficSource {
  source: string;
  medium: string;
  users: number;
  sessions: number;
  percentage: number;
}

/**
 * Traffic channel grouping
 */
export interface TrafficChannel {
  channel:
    | "Organic Search"
    | "Direct"
    | "Social"
    | "Referral"
    | "Paid Search"
    | "Email"
    | "Other";
  users: number;
  sessions: number;
  percentage: number;
  sources: TrafficSource[];
}

/**
 * Social media traffic breakdown
 */
export interface SocialTraffic {
  network: string;
  users: number;
  sessions: number;
  percentage: number;
}

/**
 * Referral traffic data
 */
export interface ReferralTraffic {
  domain: string;
  users: number;
  sessions: number;
  percentage: number;
}

/**
 * Campaign performance data
 */
export interface CampaignData {
  campaign: string;
  source: string;
  medium: string;
  users: number;
  sessions: number;
  conversions?: number;
  conversionRate?: number;
}

/**
 * Complete traffic sources report
 */
export interface TrafficSourcesReport {
  sources: TrafficSource[];
  channels: TrafficChannel[];
  socialTraffic: SocialTraffic[];
  referralTraffic: ReferralTraffic[];
  campaigns: CampaignData[];
  totalSessions: number;
}
