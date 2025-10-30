interface MapLegendItem {
  label: string;
  color: string;
  icon: "circle" | "star" | "pin";
}

/**
 * Creates legend items for the guest places map
 */
export function createMapLegendItems(
  category: string | undefined,
  hotelName: string
): MapLegendItem[] {
  const items: MapLegendItem[] = [
    { label: hotelName, color: "#10b981", icon: "star" as const },
    { label: "Recommended", color: "#eab308", icon: "pin" as const },
  ];

  // Add category-specific colors based on the current view
  if (!category || category === "gastronomy") {
    items.push({
      label: "Gastronomy",
      color: "#a855f7",
      icon: "pin" as const,
    });
  }
  if (!category || category === "tours") {
    items.push({ label: "Tours", color: "#3b82f6", icon: "pin" as const });
  }
  if (!category || category === "wellness") {
    items.push({ label: "Wellness", color: "#ec4899", icon: "pin" as const });
  }

  return items;
}
