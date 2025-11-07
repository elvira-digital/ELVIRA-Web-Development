/**
 * Pages Analytics Service
 *
 * Handles fetching page-specific analytics data like top pages, landing pages, etc.
 */

import { getAnalyticsClient, getPropertyPath } from "./client";
import type {
  PagesReport,
  PageData,
  LandingPage,
  ExitPage,
  SiteSearchData,
} from "../../types/web-analytics/pages";

/**
 * Build dimension filter for hotel-specific data
 */
function buildHotelFilter(hotelId?: string) {
  if (!hotelId) return undefined;

  return {
    filter: {
      fieldName: "customEvent:hotel_id",
      stringFilter: {
        value: hotelId,
        matchType: "EXACT" as const,
      },
    },
  };
}

/**
 * Fetch top pages data
 */
export async function fetchTopPages(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string,
  limit: number = 20
): Promise<PageData[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "screenPageViewsPerSession" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "exitRate" },
      ],
      dimensionFilter,
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit,
    });

    const pages: PageData[] = [];

    if (response.rows) {
      response.rows.forEach((row) => {
        const pagePath = row.dimensionValues?.[0]?.value || "";
        const pageTitle = row.dimensionValues?.[1]?.value || "Untitled";
        const views = parseInt(row.metricValues?.[0]?.value || "0");
        const uniqueViews = parseInt(row.metricValues?.[1]?.value || "0");
        const avgTimeOnPage = parseFloat(row.metricValues?.[2]?.value || "0");
        const bounceRate = parseFloat(row.metricValues?.[3]?.value || "0");
        const exitRate = parseFloat(row.metricValues?.[4]?.value || "0");

        pages.push({
          pagePath,
          pageTitle,
          views,
          uniqueViews,
          avgTimeOnPage: Math.round(avgTimeOnPage),
          bounceRate: Math.round(bounceRate * 100) / 100,
          exitRate: Math.round(exitRate * 100) / 100,
        });
      });
    }

    return pages;
  } catch (error) {
    console.error("Error fetching top pages:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return generateMockTopPages();
    }

    throw error;
  }
}

/**
 * Fetch landing pages data
 */
export async function fetchLandingPages(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string,
  limit: number = 15
): Promise<LandingPage[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "landingPage" }, { name: "pageTitle" }],
      metrics: [
        { name: "sessions" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
      dimensionFilter,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit,
    });

    const landingPages: LandingPage[] = [];

    if (response.rows) {
      response.rows.forEach((row) => {
        const pagePath = row.dimensionValues?.[0]?.value || "";
        const pageTitle = row.dimensionValues?.[1]?.value || "Untitled";
        const sessions = parseInt(row.metricValues?.[0]?.value || "0");
        const bounceRate = parseFloat(row.metricValues?.[1]?.value || "0");
        const avgSessionDuration = parseFloat(
          row.metricValues?.[2]?.value || "0"
        );

        landingPages.push({
          pagePath,
          pageTitle,
          sessions,
          bounceRate: Math.round(bounceRate * 100) / 100,
          avgSessionDuration: Math.round(avgSessionDuration),
        });
      });
    }

    return landingPages;
  } catch (error) {
    console.error("Error fetching landing pages:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return [
        {
          pagePath: "/",
          pageTitle: "Home - ELVIRA",
          sessions: 2500,
          bounceRate: 35.2,
          avgSessionDuration: 180,
        },
        {
          pagePath: "/hotels",
          pageTitle: "Hotels - ELVIRA",
          sessions: 1800,
          bounceRate: 28.7,
          avgSessionDuration: 240,
        },
        {
          pagePath: "/services",
          pageTitle: "Services - ELVIRA",
          sessions: 1200,
          bounceRate: 42.1,
          avgSessionDuration: 200,
        },
      ];
    }

    throw error;
  }
}

/**
 * Fetch exit pages data
 */
export async function fetchExitPages(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string,
  limit: number = 15
): Promise<ExitPage[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [
        { name: "exits" },
        { name: "exitRate" },
        { name: "screenPageViews" },
      ],
      dimensionFilter,
      orderBys: [{ metric: { metricName: "exits" }, desc: true }],
      limit,
    });

    const exitPages: ExitPage[] = [];

    if (response.rows) {
      response.rows.forEach((row) => {
        const pagePath = row.dimensionValues?.[0]?.value || "";
        const pageTitle = row.dimensionValues?.[1]?.value || "Untitled";
        const exits = parseInt(row.metricValues?.[0]?.value || "0");
        const exitRate = parseFloat(row.metricValues?.[1]?.value || "0");
        const pageViews = parseInt(row.metricValues?.[2]?.value || "0");

        exitPages.push({
          pagePath,
          pageTitle,
          exits,
          exitRate: Math.round(exitRate * 100) / 100,
          pageViews,
        });
      });
    }

    return exitPages;
  } catch (error) {
    console.error("Error fetching exit pages:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return [
        {
          pagePath: "/contact",
          pageTitle: "Contact - ELVIRA",
          exits: 800,
          exitRate: 65.2,
          pageViews: 1200,
        },
        {
          pagePath: "/checkout",
          pageTitle: "Checkout - ELVIRA",
          exits: 600,
          exitRate: 75.8,
          pageViews: 800,
        },
        {
          pagePath: "/about",
          pageTitle: "About - ELVIRA",
          exits: 400,
          exitRate: 50.3,
          pageViews: 800,
        },
      ];
    }

    throw error;
  }
}

/**
 * Fetch site search data
 */
export async function fetchSiteSearchData(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string,
  limit: number = 10
): Promise<SiteSearchData[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "searchTerm" }],
      metrics: [
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
      ],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: "searchTerm",
                stringFilter: {
                  value: "(not set)",
                  matchType: "EXACT" as const,
                  caseSensitive: false,
                },
              },
              notExpression: true,
            },
            ...(dimensionFilter ? [dimensionFilter] : []),
          ],
        },
      },
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit,
    });

    const searchData: SiteSearchData[] = [];

    if (response.rows) {
      response.rows.forEach((row) => {
        const searchTerm = row.dimensionValues?.[0]?.value || "";
        const searches = parseInt(row.metricValues?.[0]?.value || "0");
        const resultsViews = parseInt(row.metricValues?.[1]?.value || "0");
        const searchExitRate = parseFloat(row.metricValues?.[2]?.value || "0");

        if (searchTerm && searchTerm !== "(not set)") {
          searchData.push({
            searchTerm,
            searches,
            resultsViews,
            searchExitRate: Math.round(searchExitRate * 100) / 100,
          });
        }
      });
    }

    return searchData;
  } catch (error) {
    console.error("Error fetching site search data:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return [
        {
          searchTerm: "hotels near me",
          searches: 150,
          resultsViews: 300,
          searchExitRate: 25.5,
        },
        {
          searchTerm: "luxury suites",
          searches: 120,
          resultsViews: 240,
          searchExitRate: 30.2,
        },
        {
          searchTerm: "spa services",
          searches: 90,
          resultsViews: 180,
          searchExitRate: 22.8,
        },
      ];
    }

    throw error;
  }
}

/**
 * Fetch complete pages analytics report
 */
export async function fetchCompletePageReport(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string
): Promise<PagesReport> {
  try {
    const [topPages, landingPages, exitPages, siteSearches] = await Promise.all(
      [
        fetchTopPages(startDate, endDate, hotelId, 10),
        fetchLandingPages(startDate, endDate, hotelId, 10),
        fetchExitPages(startDate, endDate, hotelId, 10),
        fetchSiteSearchData(startDate, endDate, hotelId, 10),
      ]
    );

    const totalPageViews = topPages.reduce((sum, page) => sum + page.views, 0);

    return {
      topPages,
      landingPages,
      exitPages,
      loadMetrics: [], // TODO: Implement if Core Web Vitals are available
      siteSearches,
      totalPageViews,
    };
  } catch (error) {
    console.error("Error fetching complete page report:", error);
    throw error;
  }
}

/**
 * Generate mock top pages for development
 */
function generateMockTopPages(): PageData[] {
  return [
    {
      pagePath: "/",
      pageTitle: "Home - ELVIRA",
      views: 5000,
      uniqueViews: 3500,
      avgTimeOnPage: 180,
      bounceRate: 35.2,
      exitRate: 25.8,
    },
    {
      pagePath: "/hotels",
      pageTitle: "Hotels - ELVIRA",
      views: 3200,
      uniqueViews: 2800,
      avgTimeOnPage: 240,
      bounceRate: 28.7,
      exitRate: 32.1,
    },
    {
      pagePath: "/services",
      pageTitle: "Services - ELVIRA",
      views: 2100,
      uniqueViews: 1900,
      avgTimeOnPage: 200,
      bounceRate: 42.1,
      exitRate: 38.5,
    },
    {
      pagePath: "/contact",
      pageTitle: "Contact - ELVIRA",
      views: 1500,
      uniqueViews: 1300,
      avgTimeOnPage: 120,
      bounceRate: 55.3,
      exitRate: 65.2,
    },
    {
      pagePath: "/about",
      pageTitle: "About - ELVIRA",
      views: 1200,
      uniqueViews: 1000,
      avgTimeOnPage: 160,
      bounceRate: 48.9,
      exitRate: 50.3,
    },
  ];
}
