import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import { renderComponent, createUser, expectApiCall, mockApiError } from '../../../lib/test/utils.js';
import { mockEvents } from '../../../lib/test/mocks.js';
import EventsPage from '../../../routes/admin/events/+page.svelte';

// Mock confirm dialog
global.confirm = vi.fn();

describe('Admin Events List Page', () => {
	let user: any;

	beforeEach(() => {
		vi.clearAllMocks();
		global.confirm.mockReturnValue(true);
		user = createUser();
	});

	it('should render events list with search and create button', async () => {
		renderComponent(EventsPage);

		await waitFor(() => {
			expect(screen.getByText('Events')).toBeInTheDocument();
			expect(screen.getByPlaceholderText('Search events...')).toBeInTheDocument();
			expect(screen.getByRole('link', { name: /create new event/i })).toBeInTheDocument();
		});
	});

	it('should display events in a table', async () => {
		renderComponent(EventsPage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
			expect(screen.getByText('City Tour')).toBeInTheDocument();
			expect(screen.getByText('Main Hall')).toBeInTheDocument();
			expect(screen.getByText('Trinity College')).toBeInTheDocument();
		});

		// Check table headers
		expect(screen.getByText('Date')).toBeInTheDocument();
		expect(screen.getByText('Time')).toBeInTheDocument();
		expect(screen.getByText('Title')).toBeInTheDocument();
		expect(screen.getByText('Location')).toBeInTheDocument();
		expect(screen.getByText('Status')).toBeInTheDocument();
		expect(screen.getByText('Actions')).toBeInTheDocument();
	});

	it('should filter events based on search term', async () => {
		renderComponent(EventsPage);

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
	});

	it('should search by location', async () => {
		renderComponent(EventsPage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
			expect(screen.getByText('City Tour')).toBeInTheDocument();
		});

		const searchInput = screen.getByPlaceholderText('Search events...');
		await user.type(searchInput, 'Trinity');

		await waitFor(() => {
			expect(screen.queryByText('Welcome Reception')).not.toBeInTheDocument();
			expect(screen.getByText('City Tour')).toBeInTheDocument();
		});
	});

	it('should show no results message when search has no matches', async () => {
		renderComponent(EventsPage);

		const searchInput = screen.getByPlaceholderText('Search events...');
		await user.type(searchInput, 'NonexistentEvent');

		await waitFor(() => {
			expect(screen.getByText('No events match your search.')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
		});
	});

	it('should clear search when clear button is clicked', async () => {
		renderComponent(EventsPage);

		const searchInput = screen.getByPlaceholderText('Search events...');
		await user.type(searchInput, 'NonexistentEvent');

		await waitFor(() => {
			expect(screen.getByText('No events match your search.')).toBeInTheDocument();
		});

		const clearButton = screen.getByRole('button', { name: /clear search/i });
		await user.click(clearButton);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
			expect(screen.getByText('City Tour')).toBeInTheDocument();
		});

		expect(searchInput).toHaveValue('');
	});

	it('should display event count', async () => {
		renderComponent(EventsPage);

		await waitFor(() => {
			expect(screen.getByText('Showing 2 of 2 events')).toBeInTheDocument();
		});
	});

	it('should show edit links for each event', async () => {
		renderComponent(EventsPage);

		await waitFor(() => {
			const editLinks = screen.getAllByText('Edit');
			expect(editLinks).toHaveLength(2);
			
			// Check that edit links have correct href
			const firstEditLink = editLinks[0].closest('a');
			expect(firstEditLink).toHaveAttribute('href', '/admin/events/1/edit');
		});
	});

	it('should delete an event when delete button is clicked', async () => {
		renderComponent(EventsPage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		const deleteButtons = screen.getAllByText('Delete');
		await user.click(deleteButtons[0]);

		expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this event?');

		await waitFor(() => {
			expectApiCall('/api/admin/events', 'DELETE', { id: 1 });
		});

		// Event should be removed from the list
		await waitFor(() => {
			expect(screen.queryByText('Welcome Reception')).not.toBeInTheDocument();
			expect(screen.getByText('City Tour')).toBeInTheDocument();
		});
	});

	it('should not delete when user cancels confirmation', async () => {
		global.confirm.mockReturnValue(false);
		renderComponent(EventsPage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		const deleteButtons = screen.getAllByText('Delete');
		await user.click(deleteButtons[0]);

		expect(global.confirm).toHaveBeenCalled();
		expect(global.fetch).not.toHaveBeenCalledWith(
			'/api/admin/events',
			expect.objectContaining({ method: 'DELETE' })
		);

		// Event should still be in the list
		expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
	});

	it('should show error message when delete fails', async () => {
		mockApiError('/api/admin/events', 'DELETE', 'Failed to delete event');
		global.alert = vi.fn();
		renderComponent(EventsPage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		const deleteButtons = screen.getAllByText('Delete');
		await user.click(deleteButtons[0]);

		await waitFor(() => {
			expect(global.alert).toHaveBeenCalledWith('Failed to delete event: Failed to delete event');
		});

		// Event should still be in the list
		expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
	});

	it('should show loading state during delete', async () => {
		// Mock a slow delete response
		global.fetch = vi.fn().mockImplementation(() => 
			new Promise(resolve => 
				setTimeout(() => resolve({
					ok: true,
					json: () => Promise.resolve({ message: 'Event deleted successfully' })
				}), 100)
			)
		);

		renderComponent(EventsPage);

		await waitFor(() => {
			expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
		});

		const deleteButtons = screen.getAllByText('Delete');
		await user.click(deleteButtons[0]);

		await waitFor(() => {
			expect(screen.getByText('Deleting...')).toBeInTheDocument();
		});
	});

	it('should display status badges with correct styling', async () => {
		renderComponent(EventsPage);

		await waitFor(() => {
			const statusBadges = screen.getAllByText('Confirmed');
			expect(statusBadges.length).toBeGreaterThan(0);
			
			// Check for proper CSS classes (implementation-specific)
			statusBadges.forEach(badge => {
				expect(badge).toHaveClass('bg-green-100', 'text-green-800');
			});
		});
	});

	it('should show empty state when no events exist', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve([])
		});

		renderComponent(EventsPage);

		await waitFor(() => {
			expect(screen.getByText('No events found.')).toBeInTheDocument();
			expect(screen.getByRole('link', { name: /create your first event/i })).toBeInTheDocument();
		});
	});

	it('should handle loading state', () => {
		// Mock pending fetch
		global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
		
		renderComponent(EventsPage);

		expect(screen.getByText('Loading events...')).toBeInTheDocument();
	});
});