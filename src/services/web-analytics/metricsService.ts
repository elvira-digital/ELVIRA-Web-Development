/**
 * Analytics Metrics Service
 *
 * Handles fetching core analytics metrics like users, sessions, page views, etc.
 */

import { makeGA4Request, getPropertyPath } from "./client";
import type {
  MetricsReport,
  AnalyticsMetrics,
  TimeSeriesDataPoint,
  MetricsComparison,
} from "../../types/web-analytics";

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
 * Fetch basic analytics metrics for a date range
 */
export async function fetchAnalyticsMetrics(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string
): Promise<MetricsReport> {
  try {
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
      ...(dimensionFilter && { dimensionFilter }),
    };

    const response = (await makeGA4Request(
      `${property}:runReport`,
      requestBody
    )) as {
      rows?: Array<{
        dimensionValues?: Array<{ value?: string }>;
        metricValues?: Array<{ value?: string }>;
      }>;
    };

    // Process the response
    let totalUsers = 0;
    let totalNewUsers = 0;
    let totalSessions = 0;
    let totalPageViews = 0;
    let totalBounceRate = 0;
    let totalSessionDuration = 0;
    const dimensions: Array<{ date?: string; hotelId?: string }> = [];

    if (response.rows) {
      response.rows.forEach((row) => {
        const date = row.dimensionValues?.[0]?.value || "";
        const users = parseInt(row.metricValues?.[0]?.value || "0");
        const newUsers = parseInt(row.metricValues?.[1]?.value || "0");
        const sessions = parseInt(row.metricValues?.[2]?.value || "0");
        const pageViews = parseInt(row.metricValues?.[3]?.value || "0");
        const bounceRate = parseFloat(row.metricValues?.[4]?.value || "0");
        const sessionDuration = parseFloat(row.metricValues?.[5]?.value || "0");

        totalUsers += users;
        totalNewUsers += newUsers;
        totalSessions += sessions;
        totalPageViews += pageViews;
        totalBounceRate += bounceRate;
        totalSessionDuration += sessionDuration;

        dimensions.push({ date, hotelId });
      });

      // Calculate averages
      const rowCount = response.rows.length;
      if (rowCount > 0) {
        totalBounceRate = totalBounceRate / rowCount;
        totalSessionDuration = totalSessionDuration / rowCount;
      }
    }

    return {
      metrics: {
        users: totalUsers,
        newUsers: totalNewUsers,
        sessions: totalSessions,
        pageViews: totalPageViews,
        bounceRate: Math.round(totalBounceRate * 100) / 100,
        avgSessionDuration: Math.round(totalSessionDuration),
      },
      dimensions,
      dateRange: { startDate, endDate },
      totalRows: response.rows?.length,
    };
  } catch (error) {
    console.error("Error fetching analytics metrics:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return generateMockMetricsReport(startDate, endDate, hotelId);
    }

    throw error;
  }
}

/**
 * Fetch time series data for metrics over time
 */
export async function fetchTimeSeriesMetrics(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string
): Promise<TimeSeriesDataPoint[]> {
  try {
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      ...(dimensionFilter && { dimensionFilter }),
    };

    const response = (await makeGA4Request(
      `${property}:runReport`,
      requestBody
    )) as {
      rows?: Array<{
        dimensionValues?: Array<{ value?: string }>;
        metricValues?: Array<{ value?: string }>;
      }>;
    };

    const timeSeriesData: TimeSeriesDataPoint[] = [];

    if (response.rows) {
      response.rows.forEach((row) => {
        const date = row.dimensionValues?.[0]?.value || "";
        const users = parseInt(row.metricValues?.[0]?.value || "0");
        const sessions = parseInt(row.metricValues?.[1]?.value || "0");
        const pageViews = parseInt(row.metricValues?.[2]?.value || "0");
        const bounceRate = parseFloat(row.metricValues?.[3]?.value || "0");

        timeSeriesData.push({
          date,
          users,
          sessions,
          pageViews,
          bounceRate: Math.round(bounceRate * 100) / 100,
        });
      });
    }

    return timeSeriesData;
  } catch (error) {
    console.error("Error fetching time series metrics:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return generateMockTimeSeriesData();
    }

    throw error;
  }
}

/**
 * Fetch metrics comparison between two periods
 */
export async function fetchMetricsComparison(
  currentStartDate: string,
  currentEndDate: string,
  previousStartDate: string,
  previousEndDate: string,
  hotelId?: string
): Promise<MetricsComparison> {
  try {
    const [currentReport, previousReport] = await Promise.all([
      fetchAnalyticsMetrics(currentStartDate, currentEndDate, hotelId),
      fetchAnalyticsMetrics(previousStartDate, previousEndDate, hotelId),
    ]);

    const current = currentReport.metrics;
    const previous = previousReport.metrics;

    // Calculate changes and percentage changes
    const changes = {
      users: current.users - previous.users,
      newUsers: current.newUsers - previous.newUsers,
      sessions: current.sessions - previous.sessions,
      pageViews: current.pageViews - previous.pageViews,
      bounceRate: current.bounceRate - previous.bounceRate,
      avgSessionDuration:
        current.avgSessionDuration - previous.avgSessionDuration,
    };

    const percentageChanges = {
      users: previous.users
        ? Math.round(
            ((current.users - previous.users) / previous.users) * 100 * 100
          ) / 100
        : 0,
      newUsers: previous.newUsers
        ? Math.round(
            ((current.newUsers - previous.newUsers) / previous.newUsers) *
              100 *
              100
          ) / 100
        : 0,
      sessions: previous.sessions
        ? Math.round(
            ((current.sessions - previous.sessions) / previous.sessions) *
              100 *
              100
          ) / 100
        : 0,
      pageViews: previous.pageViews
        ? Math.round(
            ((current.pageViews - previous.pageViews) / previous.pageViews) *
              100 *
              100
          ) / 100
        : 0,
      bounceRate: previous.bounceRate
        ? Math.round(
            ((current.bounceRate - previous.bounceRate) / previous.bounceRate) *
              100 *
              100
          ) / 100
        : 0,
      avgSessionDuration: previous.avgSessionDuration
        ? Math.round(
            ((current.avgSessionDuration - previous.avgSessionDuration) /
              previous.avgSessionDuration) *
              100 *
              100
          ) / 100
        : 0,
    };

    return {
      current,
      previous,
      changes,
      percentageChanges,
    };
  } catch (error) {
    console.error("Error fetching metrics comparison:", error);
    throw error;
  }
}

/**
 * Generate mock metrics report for development
 */
function generateMockMetricsReport(
  startDate: string,
  endDate: string,
  hotelId?: string
): MetricsReport {
  return {
    metrics: {
      users: Math.floor(Math.random() * 10000) + 1000,
      newUsers: Math.floor(Math.random() * 5000) + 500,
      sessions: Math.floor(Math.random() * 15000) + 1500,
      pageViews: Math.floor(Math.random() * 50000) + 5000,
      bounceRate: Math.round((Math.random() * 30 + 20) * 100) / 100,
      avgSessionDuration: Math.floor(Math.random() * 300) + 120,
    },
    dimensions: [],
    dateRange: { startDate, endDate },
  };
}

/**
 * Generate mock time series data for development
 */
function generateMockTimeSeriesData(): TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split("T")[0],
      users: Math.floor(Math.random() * 500) + 100,
      sessions: Math.floor(Math.random() * 800) + 150,
      pageViews: Math.floor(Math.random() * 2000) + 300,
      bounceRate: Math.round((Math.random() * 40 + 20) * 100) / 100,
    });
  }

  return data;
}
