import { goto } from '$app/navigation';

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
}

export class ApiError extends Error {
	constructor(public status: number, message: string) {
		super(message);
		this.name = 'ApiError';
	}
}

export async function apiRequest<T = any>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	try {
		const response = await fetch(endpoint, {
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			},
			...options
		});

		if (!response.ok) {
			throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return { success: true, data };
	} catch (error) {
		const message = error instanceof ApiError ? error.message : 'Network error occurred';
		return { success: false, error: message };
	}
}

export const api = {
	// Generic CRUD operations
	async get<T>(endpoint: string): Promise<ApiResponse<T[]>> {
		return apiRequest<T[]>(endpoint);
	},

	async getById<T>(endpoint: string, id: number): Promise<ApiResponse<T>> {
		return apiRequest<T>(`${endpoint}/${id}`);
	},

	async create<T>(endpoint: string, data: Partial<T>): Promise<ApiResponse<T>> {
		return apiRequest<T>(endpoint, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	},

	async update<T>(endpoint: string, id: number, data: Partial<T>): Promise<ApiResponse<T>> {
		return apiRequest<T>(`${endpoint}/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	},

	async delete(endpoint: string, id: number): Promise<ApiResponse<void>> {
		return apiRequest<void>(endpoint, {
			method: 'DELETE',
			body: JSON.stringify({ id })
		});
	}
};

export function handleApiError(error: string, redirectTo?: string) {
	console.error('API Error:', error);
	if (redirectTo) {
		goto(redirectTo);
	}
}

export function handleApiSuccess(message: string, redirectTo?: string) {
	console.log('Success:', message);
	if (redirectTo) {
		goto(redirectTo);
	}
}