/**
 * Traffic Sources Service
 *
 * Handles fetching traffic sources, channels, and referral data.
 */

import { getAnalyticsClient, getPropertyPath } from "./client";
import type {
  TrafficSourcesReport,
  TrafficSource,
  TrafficChannel,
  SocialTraffic,
  ReferralTraffic,
} from "../../types/web-analytics/traffic";

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
 * Fetch traffic sources data
 */
export async function fetchTrafficSources(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string
): Promise<TrafficSource[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: "sessionSource" },
        { name: "sessionMedium" },
        { name: "sessionCampaignName" },
      ],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
      dimensionFilter,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 20,
    });

    const sources: TrafficSource[] = [];
    let totalSessions = 0;

    // First pass: calculate total sessions
    if (response.rows) {
      response.rows.forEach((row) => {
        totalSessions += parseInt(row.metricValues?.[1]?.value || "0");
      });

      // Second pass: build traffic sources with percentages
      response.rows.forEach((row) => {
        const source = row.dimensionValues?.[0]?.value || "Unknown";
        const medium = row.dimensionValues?.[1]?.value || "Unknown";
        const campaign = row.dimensionValues?.[2]?.value || undefined;
        const users = parseInt(row.metricValues?.[0]?.value || "0");
        const sessions = parseInt(row.metricValues?.[1]?.value || "0");
        const bounceRate = parseFloat(row.metricValues?.[2]?.value || "0");
        const avgSessionDuration = parseFloat(
          row.metricValues?.[3]?.value || "0"
        );
        const percentage =
          totalSessions > 0
            ? Math.round((sessions / totalSessions) * 100 * 100) / 100
            : 0;

        sources.push({
          source,
          medium,
          campaign,
          users,
          sessions,
          bounceRate: Math.round(bounceRate * 100) / 100,
          avgSessionDuration: Math.round(avgSessionDuration),
          percentage,
        });
      });
    }

    return sources;
  } catch (error) {
    console.error("Error fetching traffic sources:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return generateMockTrafficSources();
    }

    throw error;
  }
}

/**
 * Fetch social media traffic breakdown
 */
export async function fetchSocialTraffic(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string
): Promise<SocialTraffic[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: "sessionMedium",
                stringFilter: { value: "social", matchType: "EXACT" as const },
              },
            },
            ...(dimensionFilter ? [dimensionFilter] : []),
          ],
        },
      },
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    });

    const socialData: SocialTraffic[] = [];
    let totalSessions = 0;

    if (response.rows) {
      // Calculate total sessions
      response.rows.forEach((row) => {
        totalSessions += parseInt(row.metricValues?.[1]?.value || "0");
      });

      // Build social traffic data
      response.rows.forEach((row) => {
        const network = row.dimensionValues?.[0]?.value || "Unknown";
        const users = parseInt(row.metricValues?.[0]?.value || "0");
        const sessions = parseInt(row.metricValues?.[1]?.value || "0");
        const percentage =
          totalSessions > 0
            ? Math.round((sessions / totalSessions) * 100 * 100) / 100
            : 0;

        socialData.push({
          network,
          users,
          sessions,
          percentage,
        });
      });
    }

    return socialData;
  } catch (error) {
    console.error("Error fetching social traffic:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return [
        { network: "facebook", users: 400, sessions: 600, percentage: 45.5 },
        { network: "twitter", users: 200, sessions: 300, percentage: 22.7 },
        { network: "instagram", users: 250, sessions: 280, percentage: 21.2 },
        { network: "linkedin", users: 100, sessions: 140, percentage: 10.6 },
      ];
    }

    throw error;
  }
}

/**
 * Fetch referral traffic data
 */
export async function fetchReferralTraffic(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string
): Promise<ReferralTraffic[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: "sessionMedium",
                stringFilter: {
                  value: "referral",
                  matchType: "EXACT" as const,
                },
              },
            },
            ...(dimensionFilter ? [dimensionFilter] : []),
          ],
        },
      },
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    });

    const referralData: ReferralTraffic[] = [];
    let totalSessions = 0;

    if (response.rows) {
      // Calculate total sessions
      response.rows.forEach((row) => {
        totalSessions += parseInt(row.metricValues?.[1]?.value || "0");
      });

      // Build referral traffic data
      response.rows.forEach((row) => {
        const domain = row.dimensionValues?.[0]?.value || "Unknown";
        const users = parseInt(row.metricValues?.[0]?.value || "0");
        const sessions = parseInt(row.metricValues?.[1]?.value || "0");
        const percentage =
          totalSessions > 0
            ? Math.round((sessions / totalSessions) * 100 * 100) / 100
            : 0;

        referralData.push({
          domain,
          users,
          sessions,
          percentage,
        });
      });
    }

    return referralData;
  } catch (error) {
    console.error("Error fetching referral traffic:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return [
        { domain: "booking.com", users: 300, sessions: 450, percentage: 35.2 },
        {
          domain: "tripadvisor.com",
          users: 200,
          sessions: 320,
          percentage: 25.0,
        },
        { domain: "expedia.com", users: 150, sessions: 250, percentage: 19.5 },
        { domain: "hotels.com", users: 120, sessions: 180, percentage: 14.1 },
        { domain: "airbnb.com", users: 80, sessions: 80, percentage: 6.2 },
      ];
    }

    throw error;
  }
}

/**
 * Fetch complete traffic sources report
 */
export async function fetchCompleteTrafficReport(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string
): Promise<TrafficSourcesReport> {
  try {
    const [sources, socialTraffic, referralTraffic] = await Promise.all([
      fetchTrafficSources(startDate, endDate, hotelId),
      fetchSocialTraffic(startDate, endDate, hotelId),
      fetchReferralTraffic(startDate, endDate, hotelId),
    ]);

    // Group sources by channel
    const channels = groupSourcesByChannel(sources);
    const totalSessions = sources.reduce(
      (sum, source) => sum + source.sessions,
      0
    );

    return {
      sources,
      channels,
      socialTraffic,
      referralTraffic,
      campaigns: [], // TODO: Implement campaign data if needed
      totalSessions,
    };
  } catch (error) {
    console.error("Error fetching complete traffic report:", error);
    throw error;
  }
}

/**
 * Group traffic sources by channel
 */
function groupSourcesByChannel(sources: TrafficSource[]): TrafficChannel[] {
  const channelGroups: Record<string, TrafficSource[]> = {
    "Organic Search": [],
    Direct: [],
    Social: [],
    Referral: [],
    "Paid Search": [],
    Email: [],
    Other: [],
  };

  sources.forEach((source) => {
    let channel = "Other";

    if (source.source === "google" && source.medium === "organic") {
      channel = "Organic Search";
    } else if (source.medium === "(none)" || source.source === "direct") {
      channel = "Direct";
    } else if (source.medium === "social") {
      channel = "Social";
    } else if (source.medium === "referral") {
      channel = "Referral";
    } else if (source.medium === "cpc" || source.medium === "ppc") {
      channel = "Paid Search";
    } else if (source.medium === "email") {
      channel = "Email";
    }

    channelGroups[channel].push(source);
  });

  return Object.entries(channelGroups)
    .filter(([, sources]) => sources.length > 0)
    .map(([channelName, channelSources]) => {
      const users = channelSources.reduce((sum, s) => sum + s.users, 0);
      const sessions = channelSources.reduce((sum, s) => sum + s.sessions, 0);
      const totalSessions = sources.reduce((sum, s) => sum + s.sessions, 0);
      const percentage =
        totalSessions > 0
          ? Math.round((sessions / totalSessions) * 100 * 100) / 100
          : 0;

      return {
        channel: channelName as TrafficChannel["channel"],
        users,
        sessions,
        percentage,
        sources: channelSources,
      };
    })
    .sort((a, b) => b.sessions - a.sessions);
}

/**
 * Generate mock traffic sources for development
 */
function generateMockTrafficSources(): TrafficSource[] {
  return [
    {
      source: "google",
      medium: "organic",
      users: 1200,
      sessions: 1800,
      bounceRate: 35.2,
      avgSessionDuration: 180,
      percentage: 45.5,
    },
    {
      source: "direct",
      medium: "(none)",
      users: 800,
      sessions: 1200,
      bounceRate: 25.8,
      avgSessionDuration: 220,
      percentage: 30.3,
    },
    {
      source: "facebook",
      medium: "social",
      users: 400,
      sessions: 600,
      bounceRate: 55.1,
      avgSessionDuration: 90,
      percentage: 15.2,
    },
    {
      source: "twitter",
      medium: "social",
      users: 200,
      sessions: 300,
      bounceRate: 60.3,
      avgSessionDuration: 85,
      percentage: 7.6,
    },
    {
      source: "linkedin",
      medium: "referral",
      users: 50,
      sessions: 60,
      bounceRate: 40.2,
      avgSessionDuration: 150,
      percentage: 1.4,
    },
  ];
}
