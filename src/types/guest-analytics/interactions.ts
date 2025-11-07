/**
 * Guest Dashboard Interaction Types
 *
 * Types for tracking guest clicks and interactions within dashboard sections
 */

export interface GuestInteraction {
  guestId: string;
  hotelId: string;
  sessionId: string;
  sectionType: string; // 'amenities', 'restaurant', 'shop', 'laundry', etc.
  itemId?: string | null; // Specific item ID (amenity, menu item, product, etc.)
  itemName?: string | null; // Item name for display
  itemCategory?: string | null; // Category within section
  actionType:
    | "view"
    | "click"
    | "add_to_cart"
    | "order"
    | "detail_view"
    | "section_enter"
    | "section_exit";
  durationSeconds?: number; // For 'view' actions
  timestamp: Date;
}
