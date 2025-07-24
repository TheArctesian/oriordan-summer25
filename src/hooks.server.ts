import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Check if path starts with /admin
  if (event.url.pathname.startsWith('/admin')) {
    // You'd implement proper authentication here
    // For now, we'll use basic auth as a simple example
    const authHeader = event.request.headers.get('Authorization');

    if (!authHeader || !isValidAuth(authHeader)) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"'
        }
      });
    }

    // Set admin flag in locals
    event.locals.isAdmin = true;
  } else {
    event.locals.isAdmin = false;
  }

  return resolve(event);
};

function isValidAuth(authHeader: string): boolean {
  // Basic authentication format: "Basic base64(username:password)"
  if (!authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(':');

    // Replace with your actual authentication logic
    // This is just a placeholder example - DON'T use hardcoded credentials in production!
    return username === 'admin' && password === 'ireland2025';
  } catch (error) {
    return false;
  }
}
