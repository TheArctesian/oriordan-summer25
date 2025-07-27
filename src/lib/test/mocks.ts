import { vi } from 'vitest';

// Mock database data
export const mockEvents = [
	{
		id: 1,
		date: '2025-08-15',
		startTime: '10:00',
		endTime: '12:00',
		title: 'Welcome Reception',
		description: 'Welcome reception for all attendees',
		location: 'Main Hall',
		maxAttendees: '100',
		status: 'Confirmed',
		responsiblePerson: 'John Doe',
		contactDetails: 'john@example.com',
		websiteUrl: 'https://example.com',
		imageUrl: 'https://example.com/image.jpg',
		price: '€25',
		notes: 'Dress code: Smart casual'
	},
	{
		id: 2,
		date: '2025-08-16',
		startTime: '14:00',
		endTime: '17:00',
		title: 'City Tour',
		description: 'Guided tour of Dublin city center',
		location: 'Trinity College',
		maxAttendees: '50',
		status: 'Confirmed',
		responsiblePerson: 'Jane Smith',
		contactDetails: 'jane@example.com',
		websiteUrl: null,
		imageUrl: null,
		price: '€15',
		notes: null
	}
];

export const mockAttendees = [
	{
		id: 1,
		firstName: 'Alice',
		lastName: 'Johnson',
		partner: null,
		email: 'alice@example.com',
		phone: '+1234567890',
		countryId: 'US',
		isConfirmed: true,
		isAdult: true,
		accommodationId: 1,
		arrivalDate: '2025-08-14',
		departureDate: '2025-08-17',
		specialRequests: 'Vegetarian meals'
	},
	{
		id: 2,
		firstName: 'Bob',
		lastName: 'Wilson',
		partner: null,
		email: 'bob@example.com',
		phone: '+1987654321',
		countryId: 'CA',
		isConfirmed: false,
		isAdult: true,
		accommodationId: 2,
		arrivalDate: '2025-08-15',
		departureDate: '2025-08-16',
		specialRequests: null
	}
];

export const mockAccommodations = [
	{
		id: 1,
		name: 'Dublin City Hotel',
		address: '123 O\'Connell Street, Dublin 1',
		capacity: '200',
		notes: 'Central location, walking distance to events'
	},
	{
		id: 2,
		name: 'Temple Bar Hostel',
		address: '456 Temple Bar, Dublin 2',
		capacity: '100',
		notes: 'Budget option, shared facilities'
	}
];

export const mockEventAttendance = [
	{
		id: 1,
		eventId: 1,
		attendeeId: 1,
		status: 'Confirmed'
	},
	{
		id: 2,
		eventId: 1,
		attendeeId: 2,
		status: 'Maybe'
	},
	{
		id: 3,
		eventId: 2,
		attendeeId: 1,
		status: 'Confirmed'
	}
];

// Mock fetch responses for different endpoints
export const mockFetchResponses = {
	'/api/admin/events': {
		GET: mockEvents,
		POST: (data: any) => ({ id: 3, ...data }),
		PUT: (data: any) => ({ ...data }),
		DELETE: { message: 'Event deleted successfully' }
	},
	'/api/admin/attendees': {
		GET: mockAttendees,
		POST: (data: any) => ({ id: 3, ...data }),
		PUT: (data: any) => ({ ...data }),
		DELETE: { message: 'Attendee deleted successfully' }
	},
	'/api/admin/accommodations': {
		GET: mockAccommodations,
		POST: (data: any) => ({ id: 3, ...data }),
		PUT: (data: any) => ({ ...data }),
		DELETE: { message: 'Accommodation deleted successfully' }
	},
	'/api/admin/event-attendance': {
		GET: mockEventAttendance,
		POST: (data: any) => ({ id: 4, ...data }),
		PUT: (data: any) => ({ ...data }),
		DELETE: { message: 'Event attendance deleted successfully' }
	}
};

// Helper to mock fetch with specific responses
export function mockFetch(url: string, options: any = {}) {
	const method = options.method || 'GET';
	const endpoint = url.split('?')[0]; // Remove query params
	const responses = mockFetchResponses[endpoint as keyof typeof mockFetchResponses];
	
	if (!responses) {
		return Promise.resolve({
			ok: false,
			status: 404,
			json: () => Promise.resolve({ error: 'Not found' })
		});
	}

	const response = responses[method as keyof typeof responses];
	
	if (!response) {
		return Promise.resolve({
			ok: false,
			status: 405,
			json: () => Promise.resolve({ error: 'Method not allowed' })
		});
	}

	let data;
	if (typeof response === 'function') {
		const body = options.body ? JSON.parse(options.body) : {};
		data = response(body);
	} else {
		data = response;
	}

	return Promise.resolve({
		ok: true,
		status: 200,
		json: () => Promise.resolve(data)
	});
}

// Setup mock fetch before each test
export function setupMockFetch() {
	global.fetch = vi.fn().mockImplementation(mockFetch);
}