import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eventAttendance } from '$lib/server/db/schema';

export async function GET() {
  try {
    const allEventAttendance = await db.select()
      .from(eventAttendance);

    return json(allEventAttendance);
  } catch (error) {
    console.error('Error fetching event attendance:', error);
    return json({ error: 'Failed to fetch event attendance' }, { status: 500 });
  }
}
