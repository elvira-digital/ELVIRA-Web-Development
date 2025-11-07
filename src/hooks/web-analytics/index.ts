/**
 * Web Analytics Hooks
 *
 * Main entry point for all web analytics hooks.
 * Re-exports all hooks for easy importing.
 */

// Metrics hooks
export * from "./useAnalyticsMetrics";

// Traffic hooks
export * from "./useTrafficSources";

// Pages hooks
export * from "./usePages";

// Demographics hooks
export * from "./useDemographics";

// Convenience hook that combines commonly used metrics
export { useAnalyticsMetrics as useWebAnalytics } from "./useAnalyticsMetrics";
