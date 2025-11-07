/**
 * Google Analytics 4 Client Configuration
 *
 * Browser-compatible GA4 Data API client using REST API and OAuth2.
 * This approach works in browser environments without Node.js dependencies.
 */

// Token management for OAuth2
let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Configuration for Google Analytics 4
 */
interface GA4Config {
  propertyId: string;
  measurementId: string;
  credentials: string;
}

/**
 * Service account credentials structure
 */
interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Get GA4 configuration from environment variables
 */
function getGA4Config(): GA4Config {
  const propertyId = import.meta.env.VITE_GA4_PROPERTY_ID;
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  const credentials = import.meta.env.VITE_GA4_CREDENTIALS;

  if (!propertyId) {
    throw new Error(
      "GA4 Property ID not configured. Add VITE_GA4_PROPERTY_ID to your environment variables."
    );
  }

  if (!measurementId) {
    throw new Error(
      "GA4 Measurement ID not configured. Add VITE_GA4_MEASUREMENT_ID to your environment variables."
    );
  }

  if (!credentials) {
    throw new Error(
      "GA4 credentials not configured. Add VITE_GA4_CREDENTIALS to your environment variables."
    );
  }

  return {
    propertyId,
    measurementId,
    credentials,
  };
}

/**
 * Get OAuth2 access token for GA4 API
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const config = getGA4Config();
  const credentials: ServiceAccountCredentials = JSON.parse(config.credentials);

  // Create JWT for service account authentication
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: credentials.token_uri,
    exp: now + 3600, // 1 hour
    iat: now,
  };

  // For browser compatibility, we'll use a simplified approach
  // In production, you might want to proxy this through your backend
  try {
    const response = await fetch("/api/ga4-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credentials: config.credentials }),
    });

    if (!response.ok) {
      throw new Error("Failed to get access token");
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiresAt = Date.now() + data.expires_in * 1000;

    return accessToken;
  } catch (error) {
    console.warn("Failed to get real GA4 token, using development mode");
    // In development, return a mock token
    if (import.meta.env.DEV) {
      accessToken = "mock-token";
      tokenExpiresAt = Date.now() + 3600000;
      return accessToken!;
    }
    throw error;
  }
}

/**
 * Make authenticated request to GA4 Data API
 */
export async function makeGA4Request(
  endpoint: string,
  body: Record<string, unknown>
): Promise<unknown> {
  try {
    const token = await getAccessToken();

    const url = `https://analyticsdata.googleapis.com/v1beta/${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`GA4 API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("GA4 API request failed, using mock data in development");
    if (import.meta.env.DEV) {
      // Return mock data structure for development
      return {
        rows: [],
        metadata: {
          currencyCode: "USD",
          timeZone: "America/Los_Angeles",
        },
      };
    }
    throw error;
  }
}

/**
 * Get the property path for GA4 API calls
 */
export function getPropertyPath(): string {
  const config = getGA4Config();
  return `properties/${config.propertyId}`;
}

/**
 * Get the GA4 Measurement ID for client-side tracking
 */
export function getMeasurementId(): string {
  const config = getGA4Config();
  return config.measurementId;
}

/**
 * Reset the analytics client (useful for testing or re-initialization)
 */
export function resetAnalyticsClient(): void {
  accessToken = null;
  tokenExpiresAt = 0;
}

/**
 * Check if GA4 is properly configured
 */
export function isGA4Configured(): boolean {
  try {
    getGA4Config();
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate GA4 configuration and credentials format
 */
export async function validateGA4Configuration(): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    const config = getGA4Config();

    // Validate credentials format
    JSON.parse(config.credentials);

    // Test a simple API call to validate connection
    await makeGA4Request(`${getPropertyPath()}:runReport`, {
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      metrics: [{ name: "activeUsers" }],
      limit: 1,
    });

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}
