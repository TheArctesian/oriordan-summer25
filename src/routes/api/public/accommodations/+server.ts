import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { accommodations } from '$lib/server/db/schema';

export async function GET() {
  try {
    // Return all accommodations for public viewing
    const publicAccommodations = await db
      .select()
      .from(accommodations)
      .orderBy(accommodations.id);

    return json(publicAccommodations);
  } catch (error) {
    console.error('Error fetching public accommodations:', error);
    return json({ error: 'Failed to fetch accommodations' }, { status: 500 });
  }
}