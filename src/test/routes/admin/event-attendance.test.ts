import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import { renderComponent, createUser, expectApiCall } from '../../../lib/test/utils.js';
import { mockEvents, mockAttendees, mockEventAttendance } from '../../../lib/test/mocks.js';
import EventAttendancePage from '../../../routes/admin/event-attendance/+page.svelte';

// Mock confirm dialog
global.confirm = vi.fn();

// Mock the response to include proper joins
const mockEventAttendanceWithDetails = mockEventAttendance.map(ea => ({
	...ea,
	attendeeName: mockAttendees.find(a => a.id === ea.attendeeId)?.firstName + ' ' + 
				  mockAttendees.find(a => a.id === ea.attendeeId)?.lastName,
	email: mockAttendees.find(a => a.id === ea.attendeeId)?.email,
	countryId: mockAttendees.find(a => a.id === ea.attendeeId)?.countryId
}));

describe('Admin Event Attendance Page', () => {
	let user: any;

	beforeEach(() => {
		vi.clearAllMocks();
		global.confirm.mockReturnValue(true);
		user = createUser();

		// Mock multiple API endpoints
		global.fetch = vi.fn().mockImplementation((url: string) => {
			if (url.includes('/api/admin/event-attendance')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockEventAttendanceWithDetails)
				});
			}
			if (url.includes('/api/admin/events')) {
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
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve([])
			});
		});
	});

	it('should render event attendance page with filters', async () => {
		renderComponent(EventAttendancePage);

		await waitFor(() => {
			expect(screen.getByText('Event Attendance')).toBeInTheDocument();
			expect(screen.getByDisplayValue('All Events')).toBeInTheDocument();
			expect(screen.getByRole('link', { name: /manage attendance/i })).toBeInTheDocument();
		});
	});

	it('should display events with attendance counts', async () => {
		renderComponent(EventAttendancePage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
			expect(screen.getByText('City Tour')).toBeInTheDocument();
			expect(screen.getByText('2 Attendees')).toBeInTheDocument();
			expect(screen.getByText('1 Attendees')).toBeInTheDocument();
		});
	});

	it('should expand event to show attendees when clicked', async () => {
		renderComponent(EventAttendancePage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		// Click on the first event header
		const eventHeader = screen.getByText('Welcome Reception').closest('[role="button"]');
		await user.click(eventHeader!);

		await waitFor(() => {
			expect(screen.getByText('Attendees')).toBeInTheDocument();
			expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
			expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
		});
	});

	it('should show attendee details in expanded view', async () => {
		renderComponent(EventAttendancePage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		// Expand the first event
		const eventHeader = screen.getByText('Welcome Reception').closest('[role="button"]');
		await user.click(eventHeader!);

		await waitFor(() => {
			// Check table headers
			expect(screen.getByText('Name')).toBeInTheDocument();
			expect(screen.getByText('Email')).toBeInTheDocument();
			expect(screen.getByText('Country')).toBeInTheDocument();
			expect(screen.getByText('Status')).toBeInTheDocument();
			expect(screen.getByText('Actions')).toBeInTheDocument();

			// Check attendee data
			expect(screen.getByText('alice@example.com')).toBeInTheDocument();
			expect(screen.getByText('US')).toBeInTheDocument();
		});
	});

	it('should update attendee status when dropdown is changed', async () => {
		renderComponent(EventAttendancePage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		// Expand the first event
		const eventHeader = screen.getByText('Welcome Reception').closest('[role="button"]');
		await user.click(eventHeader!);

		await waitFor(() => {
			expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
		});

		// Find and change status dropdown
		const statusDropdowns = screen.getAllByDisplayValue('Confirmed');
		await user.selectOptions(statusDropdowns[0], 'Maybe');

		await waitFor(() => {
			expectApiCall('/api/admin/event-attendance', 'PUT', { id: 1, status: 'Maybe' });
		});
	});

	it('should remove attendee when remove button is clicked', async () => {
		renderComponent(EventAttendancePage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		// Expand the first event
		const eventHeader = screen.getByText('Welcome Reception').closest('[role="button"]');
		await user.click(eventHeader!);

		await waitFor(() => {
			expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
		});

		const removeButtons = screen.getAllByText('Remove');
		await user.click(removeButtons[0]);

		expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to remove this attendance record?');

		await waitFor(() => {
			expectApiCall('/api/admin/event-attendance', 'DELETE', { id: 1 });
		});
	});

	it('should filter events by selection', async () => {
		renderComponent(EventAttendancePage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
			expect(screen.getByText('City Tour')).toBeInTheDocument();
		});

		const eventFilter = screen.getByDisplayValue('All Events');
		await user.selectOptions(eventFilter, '1');

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
			expect(screen.queryByText('City Tour')).not.toBeInTheDocument();
		});
	});

	it('should show add attendee link for each event', async () => {
		renderComponent(EventAttendancePage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		// Expand the first event
		const eventHeader = screen.getByText('Welcome Reception').closest('[role="button"]');
		await user.click(eventHeader!);

		await waitFor(() => {
			const addAttendeeLink = screen.getByRole('link', { name: /add attendee/i });
			expect(addAttendeeLink).toHaveAttribute('href', '/admin/event-attendance/1/add');
		});
	});

	it('should show empty state for events with no attendees', async () => {
		// Mock event with no attendees
		global.fetch = vi.fn().mockImplementation((url: string) => {
			if (url.includes('/api/admin/event-attendance')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve([])
				});
			}
			if (url.includes('/api/admin/events')) {
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
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve([])
			});
		});

		renderComponent(EventAttendancePage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		// Expand the first event
		const eventHeader = screen.getByText('Welcome Reception').closest('[role="button"]');
		await user.click(eventHeader!);

		await waitFor(() => {
			expect(screen.getByText('No attendees registered for this event yet.')).toBeInTheDocument();
		});
	});

	it('should show loading state', () => {
		// Mock pending fetch
		global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
		
		renderComponent(EventAttendancePage);

		expect(screen.getByText('Loading attendance data...')).toBeInTheDocument();
	});

	it('should collapse event when clicked again', async () => {
		renderComponent(EventAttendancePage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		// Expand the first event
		const eventHeader = screen.getByText('Welcome Reception').closest('[role="button"]');
		await user.click(eventHeader!);

		await waitFor(() => {
			expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
		});

		// Click again to collapse
		await user.click(eventHeader!);

		await waitFor(() => {
			expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
		});
	});

	it('should show remove loading state', async () => {
		// Mock a slow delete response
		global.fetch = vi.fn().mockImplementation((url: string, options: any = {}) => {
			if (options.method === 'DELETE') {
				return new Promise(resolve => 
					setTimeout(() => resolve({
						ok: true,
						json: () => Promise.resolve({ message: 'Deleted successfully' })
					}), 100)
				);
			}
			// Return normal responses for other calls
			if (url.includes('/api/admin/event-attendance')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockEventAttendanceWithDetails)
				});
			}
			if (url.includes('/api/admin/events')) {
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
			return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
		});

		renderComponent(EventAttendancePage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		// Expand the first event
		const eventHeader = screen.getByText('Welcome Reception').closest('[role="button"]');
		await user.click(eventHeader!);

		await waitFor(() => {
			expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
		});

		const removeButtons = screen.getAllByText('Remove');
		await user.click(removeButtons[0]);

		await waitFor(() => {
			expect(screen.getByText('Removing...')).toBeInTheDocument();
		});
	});
});