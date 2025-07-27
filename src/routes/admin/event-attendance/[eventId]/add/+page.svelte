<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const eventId = $page.params.eventId;

	let event = null;
	let attendees = [];
	let eventAttendance = [];
	let selectedAttendee = '';
	let selectedStatus = 'Confirmed';
	let loading = false;
	let loadingData = true;
	let error = '';

	onMount(async () => {
		try {
			const [eventsResponse, attendeesResponse, attendanceResponse] = await Promise.all([
				fetch('/api/admin/events'),
				fetch('/api/admin/attendees'),
				fetch('/api/admin/event-attendance')
			]);

			const events = await eventsResponse.json();
			const allAttendees = await attendeesResponse.json();
			eventAttendance = await attendanceResponse.json();

			event = events.find((e) => e.id.toString() === eventId);

			if (!event) {
				throw new Error('Event not found');
			}

			// Filter out attendees already registered for this event
			attendees = allAttendees.filter(
				(a) =>
					!eventAttendance.some((ea) => ea.eventId === parseInt(eventId) && ea.attendeeId === a.id)
			);

			loadingData = false;
		} catch (err) {
			error = err.message;
			loadingData = false;
		}
	});

	async function handleSubmit() {
		if (!selectedAttendee) {
			error = 'Please select an attendee';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/admin/event-attendance', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					eventId: parseInt(eventId),
					attendeeId: parseInt(selectedAttendee),
					status: selectedStatus
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to add attendee to event');
			}

			goto('/admin/event-attendance');
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-irish-navy">Add Attendee to Event</h1>
		<a
			href="/admin/event-attendance"
			class="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
		>
			Back to Event Attendance
		</a>
	</div>

	{#if loadingData}
		<div class="py-8 text-center">
			<p class="text-irish-navy-light">Loading event and attendee data...</p>
		</div>
	{:else if error}
		<div class="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
			{error}
		</div>
	{:else if !event}
		<div class="rounded-lg bg-red-100 p-6 text-center text-red-700">
			<p>Event not found.</p>
		</div>
	{:else}
		<!-- Event Info -->
		<div class="mb-6 rounded-lg bg-irish-navy p-4 text-white">
			<h2 class="text-xl font-bold">{event.title}</h2>
			<p class="mt-1 opacity-90">
				{new Date(event.date).toLocaleDateString()} | {event.startTime} - {event.endTime}
				{#if event.location}| {event.location}{/if}
			</p>
		</div>

		{#if attendees.length === 0}
			<div class="rounded-lg bg-yellow-100 p-6 text-center text-yellow-700">
				<p>All attendees are already registered for this event.</p>
				<a
					href="/admin/event-attendance"
					class="mt-4 inline-block rounded bg-irish-navy px-4 py-2 text-white transition-colors hover:bg-irish-navy-light"
				>
					View Event Attendance
				</a>
			</div>
		{:else}
			<form on:submit|preventDefault={handleSubmit} class="rounded-lg bg-white p-6 shadow">
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div>
						<label for="attendee" class="block text-sm font-medium text-gray-700">Attendee*</label>
						<select
							id="attendee"
							bind:value={selectedAttendee}
							required
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:ring-irish-green focus:outline-none"
						>
							<option value="">Select an attendee</option>
							{#each attendees as attendee}
								<option value={attendee.id}>
									{attendee.firstName}
									{attendee.lastName}
									{#if attendee.email}({attendee.email}){/if}
								</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="status" class="block text-sm font-medium text-gray-700">Status*</label>
						<select
							id="status"
							bind:value={selectedStatus}
							required
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:ring-irish-green focus:outline-none"
						>
							<option value="Confirmed">Confirmed</option>
							<option value="Maybe">Maybe</option>
							<option value="Declined">Declined</option>
						</select>
					</div>
				</div>

				<div class="mt-8 flex justify-end gap-4">
					<a
						href="/admin/event-attendance"
						class="rounded bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
					>
						Cancel
					</a>
					<button
						type="submit"
						disabled={loading}
						class="rounded bg-irish-green px-6 py-2 text-white transition-colors hover:bg-irish-green-dark disabled:opacity-50"
					>
						{loading ? 'Adding...' : 'Add Attendee'}
					</button>
				</div>
			</form>
		{/if}
	{/if}
</div>
