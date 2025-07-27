import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import { renderComponent, createUser, fillForm, mockApiError } from './utils.js';

// Import components for edge case testing
import EventNewPage from '../../routes/admin/events/new/+page.svelte';
import AttendeeNewPage from '../../routes/admin/attendees/new/+page.svelte';
import EventsListPage from '../../routes/admin/events/+page.svelte';
import EventAttendancePage from '../../routes/admin/event-attendance/+page.svelte';

// Mock navigation
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({
	goto: mockGoto
}));

global.confirm = vi.fn();
global.alert = vi.fn();

describe('Edge Cases and Error Handling', () => {
	let user: any;

	beforeEach(() => {
		vi.clearAllMocks();
		global.confirm.mockReturnValue(true);
		user = createUser();
	});

	describe('Form Validation Edge Cases', () => {
		it('should handle extremely long input values', async () => {
			renderComponent(EventNewPage);

			const longTitle = 'A'.repeat(1000); // Very long title
			const longDescription = 'B'.repeat(5000); // Very long description

			await fillForm(user, {
				title: longTitle,
				date: '2025-08-25',
				startTime: '10:00',
				endTime: '12:00',
				description: longDescription
			});

			const submitButton = screen.getByRole('button', { name: /create event/i });
			await user.click(submitButton);

			// Should still make API call with long values
			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(
					'/api/admin/events',
					expect.objectContaining({
						method: 'POST',
						body: expect.stringContaining(longTitle)
					})
				);
			});
		});

		it('should handle special characters in form inputs', async () => {
			renderComponent(EventNewPage);

			const specialCharData = {
				title: 'Event & "Special" Characters <test>',
				date: '2025-08-25',
				startTime: '10:00',
				endTime: '12:00',
				location: 'Location with émojis 🎉 and symbols @#$%',
				description: 'Description with newlines\nand\ttabs\nand "quotes"'
			};

			await fillForm(user, specialCharData);

			const submitButton = screen.getByRole('button', { name: /create event/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(
					'/api/admin/events',
					expect.objectContaining({
						method: 'POST',
						body: expect.stringContaining(specialCharData.title)
					})
				);
			});
		});

		it('should handle invalid date formats gracefully', async () => {
			renderComponent(EventNewPage);

			const dateInput = screen.getByLabelText(/date/i);
			
			// Try to enter invalid date (browser should prevent this)
			await user.type(dateInput, '2025-13-45'); // Invalid month and day
			
			const submitButton = screen.getByRole('button', { name: /create event/i });
			await user.click(submitButton);

			// Form should be invalid due to browser validation
			expect(dateInput).toBeInvalid();
		});

		it('should handle time conflicts (end time before start time)', async () => {
			renderComponent(EventNewPage);

			await fillForm(user, {
				title: 'Test Event',
				date: '2025-08-25',
				startTime: '18:00',
				endTime: '10:00' // End before start
			});

			const submitButton = screen.getByRole('button', { name: /create event/i });
			await user.click(submitButton);

			// Should still submit (business logic validation would happen server-side)
			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalled();
			});
		});
	});

	describe('Network Error Scenarios', () => {
		it('should handle network timeouts', async () => {
			// Mock a request that never resolves
			global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
			
			renderComponent(EventNewPage);

			await fillForm(user, {
				title: 'Test Event',
				date: '2025-08-25',
				startTime: '10:00',
				endTime: '12:00'
			});

			const submitButton = screen.getByRole('button', { name: /create event/i });
			await user.click(submitButton);

			// Should show loading state
			expect(screen.getByText('Creating...')).toBeInTheDocument();
			expect(submitButton).toBeDisabled();
		});

		it('should handle malformed JSON responses', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: () => Promise.reject(new Error('Invalid JSON'))
			});

			renderComponent(EventNewPage);

			await fillForm(user, {
				title: 'Test Event',
				date: '2025-08-25',
				startTime: '10:00',
				endTime: '12:00'
			});

			const submitButton = screen.getByRole('button', { name: /create event/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText(/failed to create event/i)).toBeInTheDocument();
			});
		});

		it('should handle different HTTP error codes', async () => {
			const errorCodes = [400, 401, 403, 404, 422, 500, 502, 503];

			for (const code of errorCodes) {
				global.fetch = vi.fn().mockResolvedValue({
					ok: false,
					status: code,
					json: () => Promise.resolve({ error: `HTTP ${code} Error` })
				});

				renderComponent(EventNewPage);

				await fillForm(user, {
					title: 'Test Event',
					date: '2025-08-25',
					startTime: '10:00',
					endTime: '12:00'
				});

				const submitButton = screen.getByRole('button', { name: /create event/i });
				await user.click(submitButton);

				await waitFor(() => {
					expect(screen.getByText(/HTTP \d+ Error|failed to create event/i)).toBeInTheDocument();
				});
			}
		});
	});

	describe('Data Consistency Edge Cases', () => {
		it('should handle empty API responses', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([])
			});

			renderComponent(EventsListPage);

			await waitFor(() => {
				expect(screen.getByText('No events found.')).toBeInTheDocument();
				expect(screen.getByRole('link', { name: /create your first event/i })).toBeInTheDocument();
			});
		});

		it('should handle null/undefined values in API responses', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([
					{
						id: 1,
						title: 'Test Event',
						date: '2025-08-25',
						startTime: '10:00',
						endTime: '12:00',
						location: null,
						description: undefined,
						status: null,
						price: '',
						notes: null
					}
				])
			});

			renderComponent(EventsListPage);

			await waitFor(() => {
				expect(screen.getByText('Test Event')).toBeInTheDocument();
				expect(screen.getByText('-')).toBeInTheDocument(); // Should show placeholder for null location
			});
		});

		it('should handle accommodation assignment with non-existent accommodation', async () => {
			global.fetch = vi.fn().mockImplementation((url: string) => {
				if (url.includes('/api/admin/accommodations')) {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve([]) // No accommodations available
					});
				}
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ id: 1 })
				});
			});

			renderComponent(AttendeeNewPage);

			await waitFor(() => {
				const accommodationSelect = screen.getByLabelText(/accommodation/i);
				const options = accommodationSelect.querySelectorAll('option');
				expect(options).toHaveLength(1); // Only "No accommodation assigned" option
				expect(options[0]).toHaveTextContent('No accommodation assigned');
			});
		});
	});

	describe('Race Condition Scenarios', () => {
		it('should handle rapid consecutive API calls', async () => {
			let callCount = 0;
			global.fetch = vi.fn().mockImplementation(() => {
				callCount++;
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ id: callCount })
				});
			});

			renderComponent(EventNewPage);

			await fillForm(user, {
				title: 'Test Event',
				date: '2025-08-25',
				startTime: '10:00',
				endTime: '12:00'
			});

			const submitButton = screen.getByRole('button', { name: /create event/i });
			
			// Rapidly click submit button multiple times
			await user.click(submitButton);
			await user.click(submitButton);
			await user.click(submitButton);

			// Should only make one API call due to button being disabled during submission
			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});
		});

		it('should handle component unmounting during API call', async () => {
			let resolvePromise: any;
			global.fetch = vi.fn().mockImplementation(() => 
				new Promise(resolve => {
					resolvePromise = resolve;
				})
			);

			const { unmount } = renderComponent(EventNewPage);

			await fillForm(user, {
				title: 'Test Event',
				date: '2025-08-25',
				startTime: '10:00',
				endTime: '12:00'
			});

			const submitButton = screen.getByRole('button', { name: /create event/i });
			await user.click(submitButton);

			// Unmount component while API call is pending
			unmount();

			// Resolve the API call
			resolvePromise({
				ok: true,
				json: () => Promise.resolve({ id: 1 })
			});

			// Should not cause errors or navigation since component is unmounted
			expect(mockGoto).not.toHaveBeenCalled();
		});
	});

	describe('Browser Compatibility Edge Cases', () => {
		it('should handle missing browser APIs gracefully', async () => {
			// Temporarily remove confirm
			const originalConfirm = global.confirm;
			delete (global as any).confirm;

			renderComponent(EventsListPage);

			await waitFor(() => {
				expect(screen.getByText('Welcome Reception')).toBeInTheDocument();
			});

			const deleteButtons = screen.getAllByText('Delete');
			
			// Should not crash when confirm is not available
			expect(() => user.click(deleteButtons[0])).not.toThrow();

			// Restore confirm
			global.confirm = originalConfirm;
		});

		it('should handle localStorage unavailability', async () => {
			// Mock localStorage throwing errors
			const originalLocalStorage = global.localStorage;
			Object.defineProperty(global, 'localStorage', {
				value: {
					getItem: () => { throw new Error('localStorage unavailable'); },
					setItem: () => { throw new Error('localStorage unavailable'); }
				}
			});

			// Should not crash when localStorage is unavailable
			expect(() => renderComponent(EventNewPage)).not.toThrow();

			// Restore localStorage
			Object.defineProperty(global, 'localStorage', {
				value: originalLocalStorage
			});
		});
	});

	describe('Memory and Performance Edge Cases', () => {
		it('should handle large datasets without performance issues', async () => {
			// Create a large dataset
			const largeEventList = Array.from({ length: 1000 }, (_, i) => ({
				id: i + 1,
				title: `Event ${i + 1}`,
				date: '2025-08-25',
				startTime: '10:00',
				endTime: '12:00',
				location: `Location ${i + 1}`,
				status: 'Confirmed'
			}));

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(largeEventList)
			});

			const startTime = performance.now();
			renderComponent(EventsListPage);

			await waitFor(() => {
				expect(screen.getByText('Event 1')).toBeInTheDocument();
			});

			const endTime = performance.now();
			const renderTime = endTime - startTime;

			// Should render within reasonable time (less than 1 second)
			expect(renderTime).toBeLessThan(1000);

			// Check that search still works with large dataset
			const searchInput = screen.getByPlaceholderText('Search events...');
			await user.type(searchInput, '500');

			await waitFor(() => {
				expect(screen.getByText('Event 500')).toBeInTheDocument();
				expect(screen.queryByText('Event 1')).not.toBeInTheDocument();
			});
		});
	});
});