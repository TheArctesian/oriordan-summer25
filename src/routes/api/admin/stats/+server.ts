import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { attendees, events, accommodations } from '$lib/server/db/schema';
import { count } from 'drizzle-orm';

export async function GET() {
  try {
    const [attendeeResult, eventResult, accommodationResult] = await Promise.all([
      db.select({ count: count() }).from(attendees),
      db.select({ count: count() }).from(events),
      db.select({ count: count() }).from(accommodations)
    ]);

    return json({
      attendeeCount: attendeeResult[0].count,
      eventCount: eventResult[0].count,
      accommodationCount: accommodationResult[0].count
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
