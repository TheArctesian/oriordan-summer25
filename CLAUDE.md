# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit web application for managing an "Ireland Weekend 2025" event. It's a full-stack TypeScript application with a PostgreSQL database using Drizzle ORM for managing attendees, events, accommodations, and event attendance.

## Development Commands

- `yarn dev` - Start development server
- `yarn build` - Build for production  
- `yarn preview` - Preview production build
- `yarn check` - Run TypeScript and Svelte checks
- `yarn check:watch` - Run checks in watch mode
- `yarn format` - Format code with Prettier
- `yarn lint` - Lint code with Prettier
- `yarn test` - Run tests in watch mode
- `yarn test:run` - Run all tests once
- `yarn test:ui` - Run tests with UI interface
- `yarn db:push` - Push database schema changes
- `yarn db:migrate` - Run database migrations
- `yarn db:studio` - Open Drizzle Studio for database management

## Architecture

### Database Layer
- **ORM**: Drizzle ORM with Neon PostgreSQL
- **Schema**: Located in `src/lib/server/db/schema.ts`
- **Connection**: `src/lib/server/db/index.ts` exports configured `db` instance
- **Environment**: Requires `DATABASE_URL` environment variable

### Core Entities
- **attendees**: Event participants with personal info, accommodation, and travel dates
- **events**: Event details including schedule, location, capacity, and pricing
- **eventAttendance**: Junction table linking attendees to events with status
- **accommodations**: Available lodging options

### API Structure
- **Admin APIs**: `/api/admin/*` - CRUD operations for all entities
- **Public APIs**: `/api/public/*` - Read-only access for public-facing data
- **Pattern**: Each entity has corresponding admin server route in `src/routes/api/admin/[entity]/+server.ts`

### Frontend Structure
- **Admin Interface**: `/admin/*` routes for data management
- **Public Interface**: Main pages for event browsing and registration
- **Layout**: Uses `+layout.svelte` for consistent styling with Irish-themed colors
- **Styling**: TailwindCSS with custom Irish color scheme (irish-navy, irish-green, irish-orange, irish-stone)

### Key Patterns
- Server-side API routes return JSON responses with error handling
- Frontend uses `fetch()` to consume APIs with loading states
- Database queries use Drizzle's query builder syntax
- Error handling includes console logging and user-friendly error responses

## Testing

### Test Framework
- **Testing Library**: Vitest with jsdom environment
- **Component Testing**: @testing-library/svelte for component tests
- **Mocking**: Comprehensive mocks for database, APIs, and SvelteKit modules

### Test Structure
- `src/lib/test/` - Test utilities, mocks, and shared test code
- `src/test/api/` - API endpoint tests
- `src/test/routes/` - Component and page tests
- `src/lib/test/integration/` - End-to-end workflow tests
- `src/lib/test/edge-cases.test.ts` - Error handling and edge case tests

### Test Coverage
- **API Tests**: All CRUD operations for events, attendees, accommodations, event-attendance
- **Component Tests**: Form validation, search functionality, data display
- **Integration Tests**: Complete user workflows from creation to deletion
- **Edge Cases**: Error handling, validation, data consistency

### Running Tests
- `yarn test` - Interactive test runner
- `yarn test:run` - Run all tests once
- `yarn test:ui` - Visual test interface
- Tests are configured to run in jsdom environment with proper SvelteKit mocking

### Mock Data
- Comprehensive mock datasets available in `src/lib/test/mocks.ts`
- Mock database responses for consistent testing
- Mock SvelteKit navigation and stores for component testing