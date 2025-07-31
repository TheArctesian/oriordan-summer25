<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let form = {
		firstName: '',
		lastName: '',
		partner: null,
		email: '',
		phone: '',
		countryId: '',
		isConfirmed: false,
		isAdult: true,
		accommodationId: null,
		accommodationLocation: '',
		arrivalDate: '',
		departureDate: '',
		specialRequests: ''
	};

	let accommodations = [];
	let loading = false;
	let error = '';

	onMount(async () => {
		try {
			const response = await fetch('/api/admin/accommodations');
			accommodations = await response.json();
		} catch (err) {
			console.error('Failed to load accommodations:', err);
		}
	});

	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/admin/attendees', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(form)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to create attendee');
			}

			goto('/admin/attendees');
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-irish-navy">Add New Attendee</h1>
		<a
			href="/admin/attendees"
			class="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
		>
			Cancel
		</a>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
			{error}
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="rounded-lg bg-white p-6 shadow">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div>
				<label for="firstName" class="block text-sm font-medium text-gray-700">First Name*</label>
				<input
					type="text"
					id="firstName"
					bind:value={form.firstName}
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="lastName" class="block text-sm font-medium text-gray-700">Last Name*</label>
				<input
					type="text"
					id="lastName"
					bind:value={form.lastName}
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
				<input
					type="email"
					id="email"
					bind:value={form.email}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
				<input
					type="tel"
					id="phone"
					bind:value={form.phone}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="countryId" class="block text-sm font-medium text-gray-700">Country</label>
				<input
					type="text"
					id="countryId"
					bind:value={form.countryId}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="accommodationId" class="block text-sm font-medium text-gray-700"
					>Accommodation</label
				>
				<select
					id="accommodationId"
					bind:value={form.accommodationId}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				>
					<option value={null}>No accommodation assigned</option>
					{#each accommodations as accommodation}
						<option value={accommodation.id}>{accommodation.name}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="accommodationLocation" class="block text-sm font-medium text-gray-700">Accommodation Location</label>
				<input
					type="text"
					id="accommodationLocation"
					bind:value={form.accommodationLocation}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
					placeholder="e.g., Room 101, Building A"
				/>
			</div>

			<div>
				<label for="arrivalDate" class="block text-sm font-medium text-gray-700">Arrival Date</label>
				<input
					type="date"
					id="arrivalDate"
					bind:value={form.arrivalDate}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="departureDate" class="block text-sm font-medium text-gray-700"
					>Departure Date</label
				>
				<input
					type="date"
					id="departureDate"
					bind:value={form.departureDate}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>
		</div>

		<div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="flex items-center">
				<input
					type="checkbox"
					id="isAdult"
					bind:checked={form.isAdult}
					class="h-4 w-4 rounded border-gray-300 text-irish-green focus:ring-irish-green"
				/>
				<label for="isAdult" class="ml-2 block text-sm text-gray-700">Is Adult</label>
			</div>

			<div class="flex items-center">
				<input
					type="checkbox"
					id="isConfirmed"
					bind:checked={form.isConfirmed}
					class="h-4 w-4 rounded border-gray-300 text-irish-green focus:ring-irish-green"
				/>
				<label for="isConfirmed" class="ml-2 block text-sm text-gray-700">Confirmed</label>
			</div>
		</div>

		<div class="mt-6">
			<label for="specialRequests" class="block text-sm font-medium text-gray-700"
				>Special Requests</label
			>
			<textarea
				id="specialRequests"
				bind:value={form.specialRequests}
				rows="3"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
			></textarea>
		</div>

		<div class="mt-8 flex justify-end gap-4">
			<a
				href="/admin/attendees"
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
</div>