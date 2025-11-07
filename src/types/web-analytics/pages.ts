/**
 * Page Analytics Types
 *
 * Types for page-specific analytics data like page views, top pages, etc.
 */

/**
 * Individual page performance data
 */
export interface PageData {
  pagePath: string;
  pageTitle: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  exitRate?: number;
  entrances?: number;
}

/**
 * Simplified page data for basic displays
 */
export interface SimplePageData {
  pagePath: string;
  pageTitle: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
}

/**
 * Page performance with user engagement
 */
export interface DetailedPageData extends PageData {
  scrollDepth: number;
  timeOnPage: number;
  interactions: number;
  conversionRate?: number;
}

/**
 * Landing page performance
 */
export interface LandingPage {
  pagePath: string;
  pageTitle: string;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate?: number;
}

/**
 * Exit page performance
 */
export interface ExitPage {
  pagePath: string;
  pageTitle: string;
  exits: number;
  exitRate: number;
  pageViews: number;
}

/**
 * Page load performance metrics
 */
export interface PageLoadMetrics {
  pagePath: string;
  avgLoadTime: number;
  bounceRateDueToSpeed?: number;
  slowPages: number;
}

/**
 * Search results within site
 */
export interface SiteSearchData {
  searchTerm: string;
  searches: number;
  resultsViews: number;
  searchExitRate: number;
}

/**
 * Complete pages analytics report
 */
export interface PagesReport {
  topPages: PageData[];
  landingPages: LandingPage[];
  exitPages: ExitPage[];
  loadMetrics: PageLoadMetrics[];
  siteSearches: SiteSearchData[];
  totalPageViews: number;
}
