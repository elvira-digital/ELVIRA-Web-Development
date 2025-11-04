/**
 * Configuration for Guest Data Generation
 */

export const CONFIG = {
  // Hotel ID (Centro Hotel Mondial)
  testHotelId: "086e11e4-4775-4327-8448-3fa0ee7be0a5",

  // Staff ID for created_by field
  createdByStaffId: "de7ffcc4-9367-4087-a3cd-151921a36cf6",

  // Number of fake guests to create
  guestsCount: 50,

  // Batch size for database inserts
  batchSize: 25,

  // Guest data settings
  languages: ["en", "de", "es", "fr", "it", "pt"],
  roomRange: { min: 100, max: 999 },

  // Date ranges
  checkInDaysAgo: 7, // Check-ins from last 7 days
  checkOutDaysAhead: 14, // Check-outs 1-14 days in the future (guaranteed valid tokens)
};
