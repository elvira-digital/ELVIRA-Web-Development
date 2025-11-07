/**
 * Demographics Analytics Service
 *
 * Handles fetching user demographics, device information, and geographic data.
 */

import { getAnalyticsClient, getPropertyPath } from "./client";
import type {
  DemographicsReport,
  GeographicData,
  CityData,
  DeviceData,
  BrowserData,
  OperatingSystemData,
} from "../../types/web-analytics/demographics";

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
 * Fetch geographic data (countries)
 */
export async function fetchGeographicData(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string,
  limit: number = 20
): Promise<GeographicData[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "country" }, { name: "countryId" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      dimensionFilter,
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit,
    });

    const countries: GeographicData[] = [];
    let totalUsers = 0;

    // Calculate total users first
    if (response.rows) {
      response.rows.forEach((row) => {
        totalUsers += parseInt(row.metricValues?.[0]?.value || "0");
      });

      // Build geographic data with percentages
      response.rows.forEach((row) => {
        const country = row.dimensionValues?.[0]?.value || "Unknown";
        const countryCode = row.dimensionValues?.[1]?.value || undefined;
        const users = parseInt(row.metricValues?.[0]?.value || "0");
        const sessions = parseInt(row.metricValues?.[1]?.value || "0");
        const percentage =
          totalUsers > 0
            ? Math.round((users / totalUsers) * 100 * 100) / 100
            : 0;

        countries.push({
          country,
          countryCode,
          users,
          sessions,
          percentage,
        });
      });
    }

    return countries;
  } catch (error) {
    console.error("Error fetching geographic data:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return [
        {
          country: "United States",
          countryCode: "US",
          users: 2500,
          sessions: 3800,
          percentage: 35.2,
        },
        {
          country: "Spain",
          countryCode: "ES",
          users: 1800,
          sessions: 2700,
          percentage: 25.4,
        },
        {
          country: "United Kingdom",
          countryCode: "GB",
          users: 1200,
          sessions: 1900,
          percentage: 16.9,
        },
        {
          country: "France",
          countryCode: "FR",
          users: 900,
          sessions: 1400,
          percentage: 12.7,
        },
        {
          country: "Germany",
          countryCode: "DE",
          users: 700,
          sessions: 1100,
          percentage: 9.8,
        },
      ];
    }

    throw error;
  }
}

/**
 * Fetch city-level data
 */
export async function fetchCityData(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string,
  limit: number = 15
): Promise<CityData[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "city" }, { name: "country" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      dimensionFilter,
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit,
    });

    const cities: CityData[] = [];
    let totalUsers = 0;

    // Calculate total users first
    if (response.rows) {
      response.rows.forEach((row) => {
        totalUsers += parseInt(row.metricValues?.[0]?.value || "0");
      });

      // Build city data with percentages
      response.rows.forEach((row) => {
        const city = row.dimensionValues?.[0]?.value || "Unknown";
        const country = row.dimensionValues?.[1]?.value || "Unknown";
        const users = parseInt(row.metricValues?.[0]?.value || "0");
        const sessions = parseInt(row.metricValues?.[1]?.value || "0");
        const percentage =
          totalUsers > 0
            ? Math.round((users / totalUsers) * 100 * 100) / 100
            : 0;

        cities.push({
          city,
          country,
          users,
          sessions,
          percentage,
        });
      });
    }

    return cities;
  } catch (error) {
    console.error("Error fetching city data:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return [
        {
          city: "New York",
          country: "United States",
          users: 800,
          sessions: 1200,
          percentage: 15.2,
        },
        {
          city: "Madrid",
          country: "Spain",
          users: 650,
          sessions: 980,
          percentage: 12.4,
        },
        {
          city: "London",
          country: "United Kingdom",
          users: 550,
          sessions: 850,
          percentage: 10.5,
        },
      ];
    }

    throw error;
  }
}

/**
 * Fetch device category data
 */
export async function fetchDeviceData(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string
): Promise<DeviceData[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "bounceRate" },
      ],
      dimensionFilter,
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    });

    const devices: DeviceData[] = [];
    let totalUsers = 0;

    // Calculate total users first
    if (response.rows) {
      response.rows.forEach((row) => {
        totalUsers += parseInt(row.metricValues?.[0]?.value || "0");
      });

      // Build device data with percentages
      response.rows.forEach((row) => {
        const category = row.dimensionValues?.[0]?.value || "unknown";
        const users = parseInt(row.metricValues?.[0]?.value || "0");
        const sessions = parseInt(row.metricValues?.[1]?.value || "0");
        const bounceRate = parseFloat(row.metricValues?.[2]?.value || "0");
        const percentage =
          totalUsers > 0
            ? Math.round((users / totalUsers) * 100 * 100) / 100
            : 0;

        devices.push({
          category: category as DeviceData["category"],
          users,
          sessions,
          bounceRate: Math.round(bounceRate * 100) / 100,
          percentage,
        });
      });
    }

    return devices;
  } catch (error) {
    console.error("Error fetching device data:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return [
        {
          category: "mobile",
          users: 4200,
          sessions: 6300,
          bounceRate: 45.2,
          percentage: 52.5,
        },
        {
          category: "desktop",
          users: 2800,
          sessions: 4200,
          bounceRate: 32.8,
          percentage: 35.0,
        },
        {
          category: "tablet",
          users: 1000,
          sessions: 1500,
          bounceRate: 38.5,
          percentage: 12.5,
        },
      ];
    }

    throw error;
  }
}

/**
 * Fetch browser data
 */
export async function fetchBrowserData(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string,
  limit: number = 10
): Promise<BrowserData[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "browser" }, { name: "browserVersion" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      dimensionFilter,
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit,
    });

    const browsers: BrowserData[] = [];
    let totalUsers = 0;

    // Calculate total users first
    if (response.rows) {
      response.rows.forEach((row) => {
        totalUsers += parseInt(row.metricValues?.[0]?.value || "0");
      });

      // Build browser data with percentages
      response.rows.forEach((row) => {
        const browser = row.dimensionValues?.[0]?.value || "Unknown";
        const version = row.dimensionValues?.[1]?.value || undefined;
        const users = parseInt(row.metricValues?.[0]?.value || "0");
        const sessions = parseInt(row.metricValues?.[1]?.value || "0");
        const percentage =
          totalUsers > 0
            ? Math.round((users / totalUsers) * 100 * 100) / 100
            : 0;

        browsers.push({
          browser,
          version,
          users,
          sessions,
          percentage,
        });
      });
    }

    return browsers;
  } catch (error) {
    console.error("Error fetching browser data:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return [
        {
          browser: "Chrome",
          version: "118.0",
          users: 3500,
          sessions: 5200,
          percentage: 43.8,
        },
        {
          browser: "Safari",
          version: "17.0",
          users: 2200,
          sessions: 3300,
          percentage: 27.5,
        },
        {
          browser: "Firefox",
          version: "119.0",
          users: 1200,
          sessions: 1800,
          percentage: 15.0,
        },
        {
          browser: "Edge",
          version: "118.0",
          users: 800,
          sessions: 1200,
          percentage: 10.0,
        },
        {
          browser: "Opera",
          version: "104.0",
          users: 300,
          sessions: 450,
          percentage: 3.7,
        },
      ];
    }

    throw error;
  }
}

/**
 * Fetch operating system data
 */
export async function fetchOperatingSystemData(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string,
  limit: number = 10
): Promise<OperatingSystemData[]> {
  try {
    const client = getAnalyticsClient();
    const property = getPropertyPath();
    const dimensionFilter = buildHotelFilter(hotelId);

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: "operatingSystem" },
        { name: "operatingSystemVersion" },
      ],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      dimensionFilter,
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit,
    });

    const operatingSystems: OperatingSystemData[] = [];
    let totalUsers = 0;

    // Calculate total users first
    if (response.rows) {
      response.rows.forEach((row) => {
        totalUsers += parseInt(row.metricValues?.[0]?.value || "0");
      });

      // Build OS data with percentages
      response.rows.forEach((row) => {
        const os = row.dimensionValues?.[0]?.value || "Unknown";
        const version = row.dimensionValues?.[1]?.value || undefined;
        const users = parseInt(row.metricValues?.[0]?.value || "0");
        const sessions = parseInt(row.metricValues?.[1]?.value || "0");
        const percentage =
          totalUsers > 0
            ? Math.round((users / totalUsers) * 100 * 100) / 100
            : 0;

        operatingSystems.push({
          os,
          version,
          users,
          sessions,
          percentage,
        });
      });
    }

    return operatingSystems;
  } catch (error) {
    console.error("Error fetching operating system data:", error);

    // Return mock data in development
    if (import.meta.env.DEV) {
      return [
        {
          os: "Windows",
          version: "10",
          users: 3200,
          sessions: 4800,
          percentage: 40.0,
        },
        {
          os: "iOS",
          version: "17.1",
          users: 2400,
          sessions: 3600,
          percentage: 30.0,
        },
        {
          os: "Android",
          version: "13",
          users: 1600,
          sessions: 2400,
          percentage: 20.0,
        },
        {
          os: "macOS",
          version: "14.0",
          users: 800,
          sessions: 1200,
          percentage: 10.0,
        },
      ];
    }

    throw error;
  }
}

/**
 * Fetch complete demographics report
 */
export async function fetchCompleteDemographicsReport(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  hotelId?: string
): Promise<DemographicsReport> {
  try {
    const [countries, cities, devices, browsers, operatingSystems] =
      await Promise.all([
        fetchGeographicData(startDate, endDate, hotelId, 10),
        fetchCityData(startDate, endDate, hotelId, 10),
        fetchDeviceData(startDate, endDate, hotelId),
        fetchBrowserData(startDate, endDate, hotelId, 8),
        fetchOperatingSystemData(startDate, endDate, hotelId, 6),
      ]);

    const totalUsers = countries.reduce(
      (sum, country) => sum + country.users,
      0
    );

    return {
      countries,
      cities,
      devices,
      browsers,
      operatingSystems,
      screenResolutions: [], // TODO: Implement if screen resolution data is available
      totalUsers,
    };
  } catch (error) {
    console.error("Error fetching complete demographics report:", error);
    throw error;
  }
}
