import '@testing-library/jest-dom';

// Mock fetch for API tests
global.fetch = vi.fn();

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
	browser: false,
	dev: true,
	building: false,
	version: 'test'
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn(),
	preloadData: vi.fn(),
	preloadCode: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
	pushState: vi.fn(),
	replaceState: vi.fn()
}));

vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn(() => () => {})
	},
	navigating: {
		subscribe: vi.fn(() => () => {})
	},
	updated: {
		subscribe: vi.fn(() => () => {})
	}
}));

// Mock environment variables
vi.mock('$env/dynamic/private', () => ({
	env: {
		DATABASE_URL: 'postgresql://test:test@localhost:5432/test'
	}
}));

// Reset all mocks before each test
beforeEach(() => {
	vi.clearAllMocks();
});