import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['./src/lib/test/setup.ts'],
		globals: true,
		alias: {
			'$lib': new URL('./src/lib', import.meta.url).pathname,
			'$app': new URL('./src/lib/test/mocks/app', import.meta.url).pathname
		}
	}
});