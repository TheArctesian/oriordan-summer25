import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import { renderComponent, createUser, fillForm, expectApiCall } from '../utils.js';
import { mockEvents, mockAttendees, mockAccommodations } from '../mocks.js';

// Import components
import EventsListPage from '../../../routes/admin/events/+page.svelte';
import EventNewPage from '../../../routes/admin/events/new/+page.svelte';
import AttendeesListPage from '../../../routes/admin/attendees/+page.svelte';
import AttendeeNewPage from '../../../routes/admin/attendees/new/+page.svelte';
import EventAttendancePage from '../../../routes/admin/event-attendance/+page.svelte';
import EventAttendanceAddPage from '../../../routes/admin/event-attendance/[eventId]/add/+page.svelte';

// Mock navigation and page stores
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({
	goto: mockGoto
}));

vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn((callback) => {
			callback({ params: { eventId: '1' } });
			return () => {};
		})
	}
}));

global.confirm = vi.fn();

describe('Admin Workflow Integration Tests', () => {
	let user: any;

	beforeEach(() => {
		vi.clearAllMocks();
		global.confirm.mockReturnValue(true);
		user = createUser();
	});

	describe('Event Management Workflow', () => {
		it('should complete full event lifecycle: create → edit → delete', async () => {
			// Step 1: Create a new event
			let apiCallCount = 0;
			global.fetch = vi.fn().mockImplementation((url: string, options: any = {}) => {
				apiCallCount++;
				
				if (options.method === 'POST' && url.includes('/api/admin/events')) {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve({ id: 3, ...JSON.parse(options.body) })
					});
				}
				
				if (options.method === 'DELETE' && url.includes('/api/admin/events')) {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve({ message: 'Event deleted successfully' })
					});
				}
				
				// Default GET response for lists
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve([...mockEvents, { 
						id: 3, 
						title: 'New Test Event',
						date: '2025-08-25',
						startTime: '14:00',
						endTime: '16:00',
						status: 'Draft'
					}])
				});
			});

			// Create event
			const { unmount: unmountNew } = renderComponent(EventNewPage);

			const eventData = {
				title: 'New Test Event',
				date: '2025-08-25',
				startTime: '14:00',
				endTime: '16:00',
				location: 'Test Venue',
				description: 'Test event description'
			};

			await fillForm(user, eventData);
			
			const createButton = screen.getByRole('button', { name: /create event/i });
			await user.click(createButton);

			await waitFor(() => {
				expectApiCall('/api/admin/events', 'POST', eventData);
				expect(mockGoto).toHaveBeenCalledWith('/admin/events');
			});

			unmountNew();

			// Step 2: View in events list
			const { unmount: unmountList } = renderComponent(EventsListPage);

			await waitFor(() => {
				expect(screen.getByText('New Test Event')).toBeInTheDocument();
				expect(screen.getByText('Test Venue')).toBeInTheDocument();
			});

			// Step 3: Delete the event
			const deleteButtons = screen.getAllByText('Delete');
			const newEventDeleteButton = deleteButtons.find(btn => 
				btn.closest('tr')?.textContent?.includes('New Test Event')
			);

			await user.click(newEventDeleteButton!);

			await waitFor(() => {
				expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this event?');
				expectApiCall('/api/admin/events', 'DELETE', { id: 3 });
			});

			unmountList();
		});
	});

	describe('Attendee Management Workflow', () => {
		it('should create attendee and assign to accommodation', async () => {
			global.fetch = vi.fn().mockImplementation((url: string, options: any = {}) => {
				if (url.includes('/api/admin/accommodations')) {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve(mockAccommodations)
					});
				}
				
				if (options.method === 'POST' && url.includes('/api/admin/attendees')) {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve({ id: 3, ...JSON.parse(options.body) })
					});
				}
				
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockAttendees)
				});
			});

			// Create attendee
			const { unmount: unmountNew } = renderComponent(AttendeeNewPage);

			await waitFor(() => {
				expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
			});

			const attendeeData = {
				firstName: 'Charlie',
				lastName: 'Brown',
				email: 'charlie@example.com',
				phone: '+1555123456',
				countryId: 'US',
				accommodationId: '1', // Dublin City Hotel
				isAdult: true,
				isConfirmed: false
			};

			await fillForm(user, attendeeData);

			const createButton = screen.getByRole('button', { name: /add attendee/i });
			await user.click(createButton);

			await waitFor(() => {
				expectApiCall('/api/admin/attendees', 'POST', {
					...attendeeData,
					accommodationId: 1 // Should be converted to number
				});
				expect(mockGoto).toHaveBeenCalledWith('/admin/attendees');
			});

			unmountNew();

			// Verify in attendees list
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([
					...mockAttendees,
					{ 
						id: 3, 
						firstName: 'Charlie', 
						lastName: 'Brown',
						email: 'charlie@example.com',
						accommodationName: 'Dublin City Hotel',
						isConfirmed: false
					}
				])
			});

			const { unmount: unmountList } = renderComponent(AttendeesListPage);

			await waitFor(() => {
				expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
				expect(screen.getByText('charlie@example.com')).toBeInTheDocument();
				expect(screen.getByText('Dublin City Hotel')).toBeInTheDocument();
			});

			unmountList();
		});
	});

	describe('Event Attendance Workflow', () => {
		it('should add attendee to event and manage status', async () => {
			// Mock APIs for the workflow
			global.fetch = vi.fn().mockImplementation((url: string, options: any = {}) => {
				if (url.includes('/api/admin/events') && !url.includes('attendance')) {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve(mockEvents)
					});
				}
				
				if (url.includes('/api/admin/attendees')) {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve(mockAttendees)
					});
				}
				
				if (url.includes('/api/admin/event-attendance')) {
					if (options.method === 'POST') {
						return Promise.resolve({
							ok: true,
							json: () => Promise.resolve({ 
								id: 4, 
								...JSON.parse(options.body) 
							})
						});
					}
					if (options.method === 'PUT') {
						return Promise.resolve({
							ok: true,
							json: () => Promise.resolve({ 
								id: 4, 
								...JSON.parse(options.body) 
							})
						});
					}
					// GET request - return attendance data
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve([
							{
								id: 4,
								eventId: 1,
								attendeeId: 2,
								status: 'Confirmed',
								attendeeName: 'Bob Wilson',
								email: 'bob@example.com',
								countryId: 'CA'
							}
						])
					});
				}
				
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve([])
				});
			});

			// Step 1: Add attendee to event
			const { unmount: unmountAdd } = renderComponent(EventAttendanceAddPage);

			await waitFor(() => {
				expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
				expect(screen.getByLabelText(/attendee/i)).toBeInTheDocument();
			});

			// Select attendee and status
			const attendeeSelect = screen.getByLabelText(/attendee/i);
			await user.selectOptions(attendeeSelect, '2'); // Bob Wilson

			const statusSelect = screen.getByLabelText(/status/i);
			await user.selectOptions(statusSelect, 'Confirmed');

			const addButton = screen.getByRole('button', { name: /add attendee/i });
			await user.click(addButton);

			await waitFor(() => {
				expectApiCall('/api/admin/event-attendance', 'POST', {
					eventId: 1,
					attendeeId: 2,
					status: 'Confirmed'
				});
				expect(mockGoto).toHaveBeenCalledWith('/admin/event-attendance');
			});

			unmountAdd();

			// Step 2: View and update status in attendance list
			const { unmount: unmountAttendance } = renderComponent(EventAttendancePage);

			await waitFor(() => {
				expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
			});

			// Expand the event
			const eventHeader = screen.getByText('Welcome Reception').closest('[role="button"]');
			await user.click(eventHeader!);

			await waitFor(() => {
				expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
				expect(screen.getByText('bob@example.com')).toBeInTheDocument();
			});

			// Change status from Confirmed to Maybe
			const statusDropdown = screen.getByDisplayValue('Confirmed');
			await user.selectOptions(statusDropdown, 'Maybe');

			await waitFor(() => {
				expectApiCall('/api/admin/event-attendance', 'PUT', {
					id: 4,
					status: 'Maybe'
				});
			});

			unmountAttendance();
		});
	});

	describe('Search and Filter Workflows', () => {
		it('should search across different entity types', async () => {
			// Test event search
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockEvents)
			});

			const { unmount: unmountEvents } = renderComponent(EventsListPage);

			await waitFor(() => {
				expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
				expect(screen.getByText('City Tour')).toBeInTheDocument();
			});

			const searchInput = screen.getByPlaceholderText('Search events...');
			await user.type(searchInput, 'Welcome');

			await waitFor(() => {
				expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
				expect(screen.queryByText('City Tour')).not.toBeInTheDocument();
			});

			// Clear search
			await user.clear(searchInput);
			await user.type(searchInput, 'Dublin');

			await waitFor(() => {
				expect(screen.queryByText('Welcome Reception')).not.toBeInTheDocument();
				expect(screen.getByText('City Tour')).toBeInTheDocument();
			});

			unmountEvents();

			// Test attendee search
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockAttendees)
			});

			const { unmount: unmountAttendees } = renderComponent(AttendeesListPage);

			await waitFor(() => {
				expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
				expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
			});

			const attendeeSearchInput = screen.getByPlaceholderText('Search attendees...');
			await user.type(attendeeSearchInput, 'Alice');

			await waitFor(() => {
				expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
				expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
			});

			unmountAttendees();
		});
	});

	describe('Error Recovery Workflows', () => {
		it('should handle API errors gracefully and allow retry', async () => {
			let failOnce = true;
			global.fetch = vi.fn().mockImplementation((url: string, options: any = {}) => {
				if (options.method === 'POST' && failOnce) {
					failOnce = false;
					return Promise.resolve({
						ok: false,
						status: 500,
						json: () => Promise.resolve({ error: 'Server error' })
					});
				}
				
				if (options.method === 'POST') {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve({ id: 3, ...JSON.parse(options.body) })
					});
				}
				
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve([])
				});
			});

			renderComponent(EventNewPage);

			const eventData = {
				title: 'Test Event',
				date: '2025-08-25',
				startTime: '14:00',
				endTime: '16:00'
			};

			await fillForm(user, eventData);

			// First attempt - should fail
			const createButton = screen.getByRole('button', { name: /create event/i });
			await user.click(createButton);

			await waitFor(() => {
				expect(screen.getByText('Server error')).toBeInTheDocument();
			});

			expect(mockGoto).not.toHaveBeenCalled();

			// Second attempt - should succeed
			await user.click(createButton);

			await waitFor(() => {
				expect(mockGoto).toHaveBeenCalledWith('/admin/events');
			});
		});
	});
});