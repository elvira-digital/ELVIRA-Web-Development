/**
 * NotificationBadge Component
 * Displays a notification count badge
 * Used in sidebar menu items to show pending counts
 */

interface NotificationBadgeProps {
  count: number;
  isCollapsed?: boolean;
}

export function NotificationBadge({
  count,
  isCollapsed = false,
}: NotificationBadgeProps) {
  if (count === 0) return null;

  // Format count (99+ for large numbers)
  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <span
      className={`flex items-center justify-center font-bold text-white text-xs ${
        isCollapsed ? "w-5 h-5" : "min-w-5 h-5 px-1.5"
      }`}
      style={{
        backgroundColor: "#ef4444", // red-500
        borderRadius: "10px",
        fontSize: "0.7rem",
        lineHeight: "1",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
      }}
    >
      {displayCount}
    </span>
  );
}
