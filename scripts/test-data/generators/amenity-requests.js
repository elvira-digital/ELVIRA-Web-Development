import { faker } from '@faker-js/faker';

const STATUSES = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
const REQUEST_TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export async function generateAmenityRequests(supabase, hotelId, guests, amenities, config = { min: 2, max: 5 }) {
  if (!amenities || amenities.length === 0) {
    console.log('No amenities available');
    return [];
  }
  const amenityRequests = [];
  for (const guest of guests) {
    const requestCount = faker.number.int({ min: config.min, max: config.max });
    const checkIn = new Date(guest.check_in_date);
    const checkOut = new Date(guest.checkout_date);
    const stayDuration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    for (let i = 0; i < requestCount; i++) {
      const amenity = faker.helpers.arrayElement(amenities);
      const dayOffset = faker.number.int({ min: 0, max: Math.max(0, stayDuration - 1) });
      const requestDate = new Date(checkIn);
      requestDate.setDate(requestDate.getDate() + dayOffset);
      const now = new Date();
      let status;
      if (requestDate < now) {
        status = faker.helpers.weightedArrayElement([
          { value: 'completed', weight: 70 },
          { value: 'cancelled', weight: 10 },
          { value: 'approved', weight: 15 },
          { value: 'pending', weight: 5 }
        ]);
      } else {
        status = faker.helpers.weightedArrayElement([
          { value: 'pending', weight: 70 },
          { value: 'approved', weight: 25 },
          { value: 'completed', weight: 5 }
        ]);
      }
      amenityRequests.push({
        hotel_id: hotelId,
        guest_id: guest.id,
        amenity_id: amenity.id,
        request_date: requestDate.toISOString().split('T')[0],
        request_time: faker.helpers.arrayElement(REQUEST_TIMES),
        status,
        special_instructions: null,
        processed_by: null
      });
    }
  }
  return amenityRequests;
}
