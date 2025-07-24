<script lang="ts">
	import { onMount } from 'svelte';

	let attendeeCount = 0;
	let eventCount = 0;
	let accommodationCount = 0;

	onMount(async () => {
		try {
			const stats = await fetch('/api/admin/stats').then((r) => r.json());
			attendeeCount = stats.attendeeCount;
			eventCount = stats.eventCount;
			accommodationCount = stats.accommodationCount;
		} catch (error) {
			console.error('Failed to load stats', error);
		}
	});
</script>

<div>
	<h1 class="mb-8 text-3xl font-bold text-irish-navy">Admin Dashboard</h1>

	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
		<!-- Stats Cards -->
		<div class="rounded-lg bg-irish-green p-6 text-white shadow-md">
			<h3 class="mb-2 text-xl font-semibold">Attendees</h3>
			<p class="text-4xl font-bold">{attendeeCount}</p>
			<a href="/admin/attendees" class="mt-2 inline-block text-irish-white hover:underline"
				>View all →</a
			>
		</div>

		<div class="rounded-lg bg-irish-orange p-6 text-white shadow-md">
			<h3 class="mb-2 text-xl font-semibold">Events</h3>
			<p class="text-4xl font-bold">{eventCount}</p>
			<a href="/admin/events" class="mt-2 inline-block text-irish-white hover:underline"
				>View all →</a
			>
		</div>

		<div class="rounded-lg bg-irish-navy p-6 text-white shadow-md">
			<h3 class="mb-2 text-xl font-semibold">Accommodations</h3>
			<p class="text-4xl font-bold">{accommodationCount}</p>
			<a href="/admin/accommodations" class="mt-2 inline-block text-irish-white hover:underline"
				>View all →</a
			>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Quick actions -->
		<div class="rounded-lg bg-irish-stone-light p-6 shadow-md">
			<h3 class="mb-4 text-xl font-semibold text-irish-navy">Quick Actions</h3>
			<div class="space-y-3">
				<a
					href="/admin/attendees/new"
					class="block rounded bg-irish-green px-4 py-2 text-white transition-colors hover:bg-irish-green-dark"
				>
					Add New Attendee
				</a>
				<a
					href="/admin/events/new"
					class="block rounded bg-irish-orange px-4 py-2 text-white transition-colors hover:bg-irish-orange-dark"
				>
					Create New Event
				</a>
				<a
					href="/admin/event-attendance/manage"
					class="block rounded bg-irish-navy px-4 py-2 text-white transition-colors hover:bg-irish-navy-light"
				>
					Manage Event Attendance
				</a>
			</div>
		</div>

		<!-- Recent activity -->
		<div class="rounded-lg bg-irish-stone-light p-6 shadow-md">
			<h3 class="mb-4 text-xl font-semibold text-irish-navy">Upcoming Events</h3>
			<div class="space-y-4">
				<!-- This would be populated with actual data -->
				<p class="italic text-irish-navy-light">Loading upcoming events...</p>
			</div>
		</div>
	</div>
</div>
