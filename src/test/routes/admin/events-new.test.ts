import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import { renderComponent, createUser, fillForm, expectApiCall, mockApiError } from '../../../lib/test/utils.js';
import EventNewPage from '../../../routes/admin/events/new/+page.svelte';

// Mock navigation
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({
	goto: mockGoto
}));

describe('Admin Event New Page', () => {
	let user: any;

	beforeEach(() => {
		vi.clearAllMocks();
		user = createUser();
	});

	it('should render the create event form', () => {
		renderComponent(EventNewPage);

		expect(screen.getByText('Create New Event')).toBeInTheDocument();
		expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
	});

	it('should have correct default values', () => {
		renderComponent(EventNewPage);

		const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
		expect(statusSelect.value).toBe('Draft');
	});

	it('should create a new event when form is submitted', async () => {
		renderComponent(EventNewPage);

		const eventData = {
			title: 'Test Event',
			date: '2025-08-20',
			startTime: '10:00',
			endTime: '12:00',
			location: 'Test Location',
			description: 'Test description'
		};

		await fillForm(user, eventData);
		
		const submitButton = screen.getByRole('button', { name: /create event/i });
		await user.click(submitButton);

		await waitFor(() => {
			expectApiCall('/api/admin/events', 'POST', eventData);
		});

		await waitFor(() => {
			expect(mockGoto).toHaveBeenCalledWith('/admin/events');
		});
	});

	it('should require title field', async () => {
		renderComponent(EventNewPage);

		const titleInput = screen.getByLabelText(/title/i);
		const submitButton = screen.getByRole('button', { name: /create event/i });

		await user.click(submitButton);

		expect(titleInput).toBeInvalid();
	});

	it('should require date field', async () => {
		renderComponent(EventNewPage);

		const dateInput = screen.getByLabelText(/date/i);
		const submitButton = screen.getByRole('button', { name: /create event/i });

		await user.click(submitButton);

		expect(dateInput).toBeInvalid();
	});

	it('should require start and end time fields', async () => {
		renderComponent(EventNewPage);

		const startTimeInput = screen.getByLabelText(/start time/i);
		const endTimeInput = screen.getByLabelText(/end time/i);
		const submitButton = screen.getByRole('button', { name: /create event/i });

		await user.click(submitButton);

		expect(startTimeInput).toBeInvalid();
		expect(endTimeInput).toBeInvalid();
	});

	it('should show loading state during submission', async () => {
		renderComponent(EventNewPage);

		// Mock a slow API response
		global.fetch = vi.fn().mockImplementation(() => 
			new Promise(resolve => 
				setTimeout(() => resolve({
					ok: true,
					json: () => Promise.resolve({ id: 1 })
				}), 100)
			)
		);

		await fillForm(user, {
			title: 'Test Event',
			date: '2025-08-20',
			startTime: '10:00',
			endTime: '12:00'
		});

		const submitButton = screen.getByRole('button', { name: /create event/i });
		await user.click(submitButton);

		expect(screen.getByText('Creating...')).toBeInTheDocument();
		expect(submitButton).toBeDisabled();
	});

	it('should display error message on API failure', async () => {
		mockApiError('/api/admin/events', 'POST', 'Failed to create event');
		renderComponent(EventNewPage);

		await fillForm(user, {
			title: 'Test Event',
			date: '2025-08-20',
			startTime: '10:00',
			endTime: '12:00'
		});

		const submitButton = screen.getByRole('button', { name: /create event/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText('Failed to create event')).toBeInTheDocument();
		});

		expect(mockGoto).not.toHaveBeenCalled();
	});

	it('should navigate to events list when cancel is clicked', async () => {
		renderComponent(EventNewPage);

		const cancelLink = screen.getByRole('link', { name: /cancel/i });
		expect(cancelLink).toHaveAttribute('href', '/admin/events');
	});

	it('should handle all status options', async () => {
		renderComponent(EventNewPage);

		const statusSelect = screen.getByLabelText(/status/i);
		
		expect(screen.getByRole('option', { name: 'Draft' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Tentative' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Confirmed' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Cancelled' })).toBeInTheDocument();

		await user.selectOptions(statusSelect, 'Confirmed');
		expect(statusSelect).toHaveValue('Confirmed');
	});

	it('should handle optional fields correctly', async () => {
		renderComponent(EventNewPage);

		const eventData = {
			title: 'Test Event',
			date: '2025-08-20',
			startTime: '10:00',
			endTime: '12:00',
			maxAttendees: '50',
			price: '€25',
			websiteUrl: 'https://example.com',
			imageUrl: 'https://example.com/image.jpg',
			responsiblePerson: 'John Doe',
			contactDetails: 'john@example.com',
			notes: 'Some notes'
		};

		await fillForm(user, eventData);

		const submitButton = screen.getByRole('button', { name: /create event/i });
		await user.click(submitButton);

		await waitFor(() => {
			expectApiCall('/api/admin/events', 'POST', eventData);
		});
	});
});