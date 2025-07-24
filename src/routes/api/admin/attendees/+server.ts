import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { attendees, accommodations } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const results = await db
      .select({
        id: attendees.id,
        firstName: attendees.firstName,
        lastName: attendees.lastName,
        email: attendees.email,
        phone: attendees.phone,
        countryId: attendees.countryId,
        isConfirmed: attendees.isConfirmed,
        isAdult: attendees.isAdult,
        accommodationId: attendees.accommodationId,
        arrivalDate: attendees.arrivalDate,
        departureDate: attendees.departureDate,
        specialRequests: attendees.specialRequests
      })
      .from(attendees)
      .leftJoin(accommodations, eq(attendees.accommodationId, accommodations.id))
      .orderBy(attendees.lastName, attendees.firstName);

    // Add accommodation name to each attendee
    const attendeesWithAccommodation = results.map((row) => {
      return {
        ...row,
        accommodationName: row.accommodations ? row.accommodations.name : null
      };
    });

    return json(attendeesWithAccommodation);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    return json({ error: 'Failed to fetch attendees' }, { status: 500 });
  }
}
