import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { attendees } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.firstName || !data.lastName) {
      return json({ error: 'First name and last name are required' }, { status: 400 });
    }

    // Check if email already exists
    if (data.email) {
      const existingAttendee = await db
        .select({ id: attendees.id })
        .from(attendees)
        .where(eq(attendees.email, data.email))
        .limit(1);

      if (existingAttendee.length > 0) {
        return json({ error: 'An attendee with this email already exists' }, { status: 409 });
      }
    }

    // Insert new attendee
    const result = await db.insert(attendees)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        partner: data.partner || null,
        email: data.email || null,
        phone: data.phone || null,
        countryId: data.countryId || null,
        isConfirmed: false, // Default to not confirmed
        isAdult: data.isAdult || true,
        accommodationId: data.accommodationId || null,
        accommodationLocation: data.accommodationLocation || null,
        arrivalDate: data.arrivalDate || null,
        departureDate: data.departureDate || null,
        specialRequests: data.specialRequests || null
      })
      .returning();

    return json({ 
      message: 'Registration successful!', 
      attendee: result[0] 
    });
  } catch (error) {
    console.error('Error registering attendee:', error);
    return json({ error: 'Failed to register attendee' }, { status: 500 });
  }
}