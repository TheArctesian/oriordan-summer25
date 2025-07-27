import { render, type RenderResult } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { setupMockFetch } from './mocks.js';

// Create a user event instance for each test
export function createUser() {
	return userEvent.setup();
}

// Wrapper for rendering Svelte components with common setup
export function renderComponent(component: any, props: any = {}): RenderResult {
	setupMockFetch();
	return render(component, { props });
}

// Helper to wait for async operations to complete
export function waitForAsync(timeout = 100) {
	return new Promise(resolve => setTimeout(resolve, timeout));
}

// Helper to create form data for testing
export function createFormData(data: Record<string, any>) {
	const formData = new FormData();
	Object.entries(data).forEach(([key, value]) => {
		if (value !== null && value !== undefined) {
			formData.append(key, value.toString());
		}
	});
	return formData;
}

// Helper to simulate API errors
export function mockApiError(endpoint: string, method: string, error: string, status = 500) {
	global.fetch = vi.fn().mockImplementation((url: string, options: any = {}) => {
		const requestMethod = options.method || 'GET';
		const requestEndpoint = url.split('?')[0];
		
		if (requestEndpoint === endpoint && requestMethod === method) {
			return Promise.resolve({
				ok: false,
				status,
				json: () => Promise.resolve({ error })
			});
		}
		
		// Fall back to normal mock for other requests
		return Promise.resolve({
			ok: true,
			status: 200,
			json: () => Promise.resolve([])
		});
	});
}

// Helper to verify API calls
export function expectApiCall(url: string, method: string, data?: any) {
	expect(fetch).toHaveBeenCalledWith(
		url,
		expect.objectContaining({
			method,
			headers: { 'Content-Type': 'application/json' },
			...(data && { body: JSON.stringify(data) })
		})
	);
}

// Helper to fill out form fields
export async function fillForm(user: any, formData: Record<string, any>) {
	for (const [field, value] of Object.entries(formData)) {
		const element = document.querySelector(`[name="${field}"], [id="${field}"]`);
		if (element) {
			if (element.tagName === 'SELECT') {
				await user.selectOptions(element, value);
			} else if (element.type === 'checkbox') {
				if (value) {
					await user.click(element);
				}
			} else {
				await user.clear(element);
				await user.type(element, value.toString());
			}
		}
	}
}