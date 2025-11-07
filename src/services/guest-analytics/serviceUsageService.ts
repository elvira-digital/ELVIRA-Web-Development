/**
 * Guest Service Usage Service
 *
 * Service for tracking and analyzing guest service usage patterns
 */

import type {
  ServiceUsage,
  FeatureUsage,
  PopularFeatures,
} from "../../types/guest-analytics";

/**
 * Generate realistic service usage data
 */
export function generateServiceUsage(hotelId?: string): ServiceUsage[] {
  const baseMultiplier = hotelId ? 0.3 : 1;

  const services = [
    { name: "Room Service", category: "room-service" as const, popularity: 85 },
    { name: "Housekeeping", category: "room-service" as const, popularity: 92 },
    { name: "Concierge", category: "concierge" as const, popularity: 67 },
    { name: "Pool & Spa", category: "facilities" as const, popularity: 78 },
    {
      name: "Restaurant Reservations",
      category: "concierge" as const,
      popularity: 71,
    },
    {
      name: "Maintenance Request",
      category: "maintenance" as const,
      popularity: 45,
    },
    { name: "Local Information", category: "info" as const, popularity: 83 },
    { name: "Transportation", category: "concierge" as const, popularity: 59 },
  ];

  return services.map((service) => ({
    serviceName: service.name,
    category: service.category,
    requestCount: Math.floor(
      (service.popularity * 3 + Math.random() * 50) * baseMultiplier
    ),
    completionRate: 85 + Math.random() * 12, // 85-97%
    avgResponseTime: 15 + Math.random() * 30, // 15-45 minutes
    popularityScore: service.popularity + (Math.random() - 0.5) * 10,
  }));
}

/**
 * Generate popular dashboard features usage
 */
export function generatePopularFeatures(hotelId?: string): PopularFeatures {
  const baseMultiplier = hotelId ? 0.3 : 1;

  const createFeatureUsage = (
    name: string,
    category: FeatureUsage["category"],
    baseUsage: number
  ): FeatureUsage => ({
    hotelId,
    dateRange: "30daysAgo",
    lastUpdated: new Date(),
    featureName: name,
    category,
    usageCount: Math.floor(
      baseUsage * baseMultiplier * (0.8 + Math.random() * 0.4)
    ),
    uniqueUsers: Math.floor(
      baseUsage * 0.7 * baseMultiplier * (0.8 + Math.random() * 0.4)
    ),
    avgTimeSpent: 30 + Math.random() * 120, // 30-150 seconds
    satisfactionScore: 4.1 + Math.random() * 0.8, // 4.1-4.9
  });

  return {
    roomService: createFeatureUsage("Room Service Orders", "service", 450),
    concierge: createFeatureUsage("Concierge Requests", "service", 320),
    housekeeping: createFeatureUsage("Housekeeping Requests", "service", 380),
    facilities: createFeatureUsage("Facility Bookings", "service", 290),
    checkout: createFeatureUsage("Express Checkout", "service", 520),
    maintenance: createFeatureUsage(
      "Maintenance Reports",
      "communication",
      180
    ),
  };
}

/**
 * Simulate fetching service usage from API
 */
export async function fetchServiceUsage(
  hotelId?: string
): Promise<ServiceUsage[]> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return generateServiceUsage(hotelId);
}

/**
 * Simulate fetching popular features from API
 */
export async function fetchPopularFeatures(
  hotelId?: string
): Promise<PopularFeatures> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return generatePopularFeatures(hotelId);
}
