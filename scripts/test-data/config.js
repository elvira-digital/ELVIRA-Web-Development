/**
 * Configuration for Guest Data Generation
 */

export const CONFIG = {
  // Hotel ID (Centro Hotel Mondial)
  testHotelId: "086e11e4-4775-4327-8448-3fa0ee7be0a5",

  // Staff ID for created_by field
  createdByStaffId: "de7ffcc4-9367-4087-a3cd-151921a36cf6",

  // Phase 1: Stress test with 500 rooms (~1,200 guests)
  roomsCount: 500,

  // Batch size for database inserts
  batchSize: 500, // Increased for faster inserts

  // Guest data settings
  languages: [
    "en",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "nl",
    "sv",
    "no",
    "da",
    "fi",
    "ja",
    "zh",
    "hi",
  ],
  countries: [
    "US",
    "GB",
    "CA",
    "AU",
    "DE",
    "FR",
    "ES",
    "IT",
    "JP",
    "CN",
    "IN",
    "BR",
    "MX",
    "NL",
    "SE",
    "NO",
    "DK",
    "FI",
    "PT",
    "GR",
  ],
  roomRange: { min: 100, max: 999 },
  guestsPerRoom: { min: 1, max: 4 }, // 1-4 guests per room (solo/couple/family)

  // Date ranges for realistic check-in/checkout
  checkInDaysAgo: 7, // Check-ins from last 7 days
  stayDuration: { min: 1, max: 14 }, // Stay length: 1-14 days

  // Phase 2: Order generation settings (orders per guest)
  orders: {
    amenityRequests: { min: 2, max: 5 },
    restaurantOrders: { min: 1, max: 3 },
    shopOrders: { min: 0, max: 2 },
    laundryOrders: { min: 0, max: 2 },
  },
};
