export interface ValidationRule {
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	custom?: (value: any) => string | null;
}

export interface ValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

export function validateField(value: any, rules: ValidationRule): string | null {
	if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
		return 'This field is required';
	}

	if (value && typeof value === 'string') {
		if (rules.minLength && value.length < rules.minLength) {
			return `Must be at least ${rules.minLength} characters`;
		}

		if (rules.maxLength && value.length > rules.maxLength) {
			return `Must be no more than ${rules.maxLength} characters`;
		}

		if (rules.pattern && !rules.pattern.test(value)) {
			return 'Invalid format';
		}
	}

	if (rules.custom) {
		return rules.custom(value);
	}

	return null;
}

export function validateForm(data: Record<string, any>, schema: Record<string, ValidationRule>): ValidationResult {
	const errors: Record<string, string> = {};
	
	for (const [field, rules] of Object.entries(schema)) {
		const error = validateField(data[field], rules);
		if (error) {
			errors[field] = error;
		}
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	};
}

export function extractFormData(formData: FormData): Record<string, any> {
	const data: Record<string, any> = {};
	
	for (const [key, value] of formData.entries()) {
		if (key.endsWith('[]')) {
			// Handle array fields
			const arrayKey = key.slice(0, -2);
			if (!data[arrayKey]) data[arrayKey] = [];
			data[arrayKey].push(value);
		} else {
			data[key] = value;
		}
	}

	return data;
}

export function serializeFormData(data: Record<string, any>): FormData {
	const formData = new FormData();
	
	for (const [key, value] of Object.entries(data)) {
		if (Array.isArray(value)) {
			value.forEach(item => formData.append(`${key}[]`, item));
		} else if (value !== null && value !== undefined) {
			formData.append(key, String(value));
		}
	}

	return formData;
}