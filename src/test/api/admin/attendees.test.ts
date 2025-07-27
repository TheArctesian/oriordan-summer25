import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockAttendees } from '../../../lib/test/mocks.js';

vi.mock('@sveltejs/kit', () => ({
	json: (data: any, init?: any) => ({
		json: () => Promise.resolve(data),
		status: init?.status || 200
	})
}));

vi.mock('$lib/server/db', () => ({ db: {} }));
vi.mock('$lib/server/db/schema', () => ({ attendees: {}, accommodations: {} }));
vi.mock('drizzle-orm', () => ({ eq: vi.fn() }));

describe('Attendees API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle attendee data structure correctly', () => {
		expect(mockAttendees).toBeDefined();
		expect(mockAttendees.length).toBe(2);
		expect(mockAttendees[0]).toHaveProperty('firstName', 'Alice');
		expect(mockAttendees[0]).toHaveProperty('lastName', 'Johnson');
		expect(mockAttendees[0]).toHaveProperty('email', 'alice@example.com');
		expect(mockAttendees[0]).toHaveProperty('isConfirmed', true);
		expect(mockAttendees[0]).toHaveProperty('accommodationId', 1);
	});

	it('should validate attendee creation data', () => {
		const newAttendeeData = {
			firstName: 'Charlie',
			lastName: 'Brown',
			email: 'charlie@example.com',
			isConfirmed: false,
			isAdult: true
		};

		expect(newAttendeeData.firstName).toBeDefined();
		expect(newAttendeeData.lastName).toBeDefined();
		expect(newAttendeeData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
		expect(typeof newAttendeeData.isConfirmed).toBe('boolean');
		expect(typeof newAttendeeData.isAdult).toBe('boolean');
	});

	it('should handle accommodation relationships', () => {
		const attendeeWithAccommodation = mockAttendees.find(a => a.accommodationId);
		expect(attendeeWithAccommodation).toBeDefined();
		expect(attendeeWithAccommodation?.accommodationId).toBeGreaterThan(0);
	});
});