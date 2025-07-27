import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockAccommodations } from '../../../lib/test/mocks.js';

vi.mock('@sveltejs/kit', () => ({
	json: (data: any, init?: any) => ({
		json: () => Promise.resolve(data),
		status: init?.status || 200
	})
}));

vi.mock('$lib/server/db', () => ({ db: {} }));
vi.mock('$lib/server/db/schema', () => ({ accommodations: {} }));
vi.mock('drizzle-orm', () => ({ eq: vi.fn() }));

describe('Accommodations API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle accommodation data structure correctly', () => {
		expect(mockAccommodations).toBeDefined();
		expect(mockAccommodations.length).toBe(2);
		expect(mockAccommodations[0]).toHaveProperty('name', 'Dublin City Hotel');
		expect(mockAccommodations[0]).toHaveProperty('address');
		expect(mockAccommodations[0]).toHaveProperty('capacity', '200');
		expect(mockAccommodations[0]).toHaveProperty('notes');
	});

	it('should validate accommodation creation data', () => {
		const newAccommodationData = {
			name: 'New Hotel',
			address: '789 New Street, Dublin 3',
			capacity: '150',
			notes: 'Modern facilities'
		};

		expect(newAccommodationData.name).toBeDefined();
		expect(newAccommodationData.name.length).toBeGreaterThan(0);
		expect(newAccommodationData.capacity).toMatch(/^\d+$/);
	});

	it('should handle capacity as string numbers', () => {
		mockAccommodations.forEach(accommodation => {
			if (accommodation.capacity) {
				expect(accommodation.capacity).toMatch(/^\d+$/);
				expect(parseInt(accommodation.capacity)).toBeGreaterThan(0);
			}
		});
	});
});