<script lang="ts">
	import { onMount } from 'svelte';

	let events = [];
	let attendees = [];
	let eventAttendance = [];
	let loading = true;
	let selectedEvent = '';
	let selectedAttendee = '';
	let selectedStatus = 'Confirmed';
	let message = '';
	let isError = false;

	onMount(async () => {
		try {
			const [eventsResponse, attendeesResponse, attendanceResponse] = await Promise.all([
				fetch('/api/admin/events').then((r) => r.json()),
				fetch('/api/admin/attendees').then((r) => r.json()),
				fetch('/api/admin/event-attendance').then((r) => r.json())
			]);

			events = eventsResponse.sort((a, b) => new Date(a.date) - new Date(b.date));
			attendees = attendeesResponse.sort((a, b) =>
				`${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
			);
			eventAttendance = attendanceResponse;
			loading = false;
		} catch (error) {
			console.error('Failed to load data', error);
			loading = false;
			message = 'Failed to load required data';
			isError = true;
		}
	});

	$: filteredAttendees = selectedEvent
		? attendees.filter(
				(a) =>
					!eventAttendance.some(
						(ea) => ea.eventId === parseInt(selectedEvent) && ea.attendeeId === a.id
					)
			)
		: [];

	async function addAttendance() {
		if (!selectedEvent || !selectedAttendee || !selectedStatus) {
			message = 'Please select an event, attendee, and status';
			isError = true;
			return;
		}

		try {
			const response = await fetch('/api/admin/event-attendance', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					eventId: parseInt(selectedEvent),
					attendeeId: parseInt(selectedAttendee),
					status: selectedStatus
				})
			});

			if (!response.ok) {
				throw new Error('Failed to add attendance');
			}

			const newAttendance = await response.json();

			// Update the local attendance list
			eventAttendance = [...eventAttendance, newAttendance];

			// Reset form
			selectedAttendee = '';
			message = 'Attendance record added successfully';
			isError = false;
		} catch (error) {
			console.error('Error adding attendance:', error);
			message = 'Failed to add attendance';
			isError = true;
		}
	}

	function getEventById(id) {
		return events.find((e) => e.id === parseInt(id));
	}
</script>

<div>
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-irish-navy">Manage Event Attendance</h1>
		<p class="mt-2 text-gray-600">Add or update attendance records for events</p>
	</div>

	{#if loading}
		<div class="py-8 text-center">
			<p class="text-irish-navy-light">Loading data...</p>
		</div>
	{:else}
		<!-- Add attendance form -->
		<div class="mb-8 rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-bold text-irish-navy">Add New Attendance Record</h2>

			{#if message}
				<div
					class={`mb-4 rounded p-3 ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
				>
					{message}
				</div>
			{/if}

			<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div>
					<label for="event" class="mb-1 block font-medium text-gray-700">Event</label>
					<select
						id="event"
						bind:value={selectedEvent}
						class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:ring-2 focus:ring-irish-green focus:outline-none"
					>
						<option value="">Select an event</option>
						{#each events as event}
							<option value={event.id}>
								{event.title} ({new Date(event.date).toLocaleDateString()})
							</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="attendee" class="mb-1 block font-medium text-gray-700">Attendee</label>
					<select
						id="attendee"
						bind:value={selectedAttendee}
						disabled={!selectedEvent}
						class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:ring-2 focus:ring-irish-green focus:outline-none disabled:cursor-not-allowed disabled:bg-irish-stone-light"
					>
						<option value="">Select an attendee</option>
						{#each filteredAttendees as attendee}
							<option value={attendee.id}>
								{attendee.firstName}
								{attendee.lastName}
							</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="status" class="mb-1 block font-medium text-gray-700">Status</label>
					<select
						id="status"
						bind:value={selectedStatus}
						class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:ring-2 focus:ring-irish-green focus:outline-none"
					>
						<option value="Confirmed">Confirmed</option>
						<option value="Maybe">Maybe</option>
						<option value="Declined">Declined</option>
					</select>
				</div>

				<div class="flex items-end">
					<button
						on:click={addAttendance}
						disabled={!selectedEvent || !selectedAttendee}
						class="w-full rounded-lg bg-irish-green px-4 py-2 text-white transition-colors hover:bg-irish-green-dark disabled:bg-gray-400"
					>
						Add Attendance
					</button>
				</div>
			</div>
			<div class="mt-4 rounded-lg bg-irish-stone-light p-3">
				<h3 class="font-medium text-irish-navy">Event Details</h3>
				{#if selectedEvent}
					{@const event = getEventById(selectedEvent)}
					{#if event}
						<p class="mt-1 text-sm">
							<span class="font-medium">Date:</span>
							{new Date(event.date).toLocaleDateString()}<br />
							<span class="font-medium">Time:</span>
							{event.startTime} - {event.endTime}<br />
							<span class="font-medium">Location:</span>
							{event.location}
						</p>
					{/if}
				{/if}
			</div>
		</div>
		<!-- Quick links to events -->
		<div class="mb-8">
			<h2 class="mb-4 text-xl font-bold text-irish-navy">Quick Access to Events</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each events.slice(0, 6) as event}
					{@const attendeesCount = eventAttendance.filter((ea) => ea.eventId === event.id).length}
					<a
						href={`/admin/event-attendance?event=${event.id}`}
						class="rounded-lg border border-irish-stone bg-white p-4 transition-shadow hover:shadow"
					>
						<h3 class="font-bold text-irish-navy">{event.title}</h3>
						<p class="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
						<div class="mt-2 flex items-center justify-between">
							<span class="rounded-full bg-irish-green px-2 py-0.5 text-xs text-white">
								{attendeesCount} attendees
							</span>
							<span class="text-sm text-irish-green">View →</span>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>
