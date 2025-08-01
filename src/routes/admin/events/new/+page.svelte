<script lang="ts">
	import { goto } from '$app/navigation';

	let form = {
		date: '',
		startTime: '',
		endTime: '',
		title: '',
		description: '',
		location: '',
		maxAttendees: '',
		status: 'Draft',
		responsiblePerson: '',
		contactDetails: '',
		websiteUrl: '',
		imageUrl: '',
		price: '',
		notes: ''
	};

	let loading = false;
	let error = '';

	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/admin/events', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(form)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to create event');
			}

			goto('/admin/events');
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-irish-navy">Create New Event</h1>
		<a
			href="/admin/events"
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
				<label for="title" class="block text-sm font-medium text-gray-700">Title*</label>
				<input
					type="text"
					id="title"
					bind:value={form.title}
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="status" class="block text-sm font-medium text-gray-700">Status</label>
				<select
					id="status"
					bind:value={form.status}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				>
					<option value="Draft">Draft</option>
					<option value="Tentative">Tentative</option>
					<option value="Confirmed">Confirmed</option>
					<option value="Cancelled">Cancelled</option>
				</select>
			</div>

			<div>
				<label for="date" class="block text-sm font-medium text-gray-700">Date*</label>
				<input
					type="date"
					id="date"
					bind:value={form.date}
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="startTime" class="block text-sm font-medium text-gray-700">Start Time</label>
				<input
					type="text"
					id="startTime"
					bind:value={form.startTime}
					placeholder="e.g. 2:00 PM, 14:00"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="endTime" class="block text-sm font-medium text-gray-700">End Time</label>
				<input
					type="text"
					id="endTime"
					bind:value={form.endTime}
					placeholder="e.g. 4:00 PM, 16:00"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="location" class="block text-sm font-medium text-gray-700">Location</label>
				<input
					type="text"
					id="location"
					bind:value={form.location}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="maxAttendees" class="block text-sm font-medium text-gray-700">Max Attendees</label>
				<input
					type="text"
					id="maxAttendees"
					bind:value={form.maxAttendees}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="price" class="block text-sm font-medium text-gray-700">Price</label>
				<input
					type="text"
					id="price"
					bind:value={form.price}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="responsiblePerson" class="block text-sm font-medium text-gray-700"
					>Responsible Person</label
				>
				<input
					type="text"
					id="responsiblePerson"
					bind:value={form.responsiblePerson}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="contactDetails" class="block text-sm font-medium text-gray-700"
					>Contact Details</label
				>
				<input
					type="text"
					id="contactDetails"
					bind:value={form.contactDetails}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="websiteUrl" class="block text-sm font-medium text-gray-700">Website URL</label>
				<input
					type="url"
					id="websiteUrl"
					bind:value={form.websiteUrl}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>

			<div>
				<label for="imageUrl" class="block text-sm font-medium text-gray-700">Image URL</label>
				<input
					type="url"
					id="imageUrl"
					bind:value={form.imageUrl}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				/>
			</div>
		</div>

		<div class="mt-6">
			<label for="description" class="block text-sm font-medium text-gray-700">Description</label>
			<textarea
				id="description"
				bind:value={form.description}
				rows="4"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
			></textarea>
		</div>

		<div class="mt-6">
			<label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
			<textarea
				id="notes"
				bind:value={form.notes}
				rows="3"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
			></textarea>
		</div>

		<div class="mt-8 flex justify-end gap-4">
			<a
				href="/admin/events"
				class="rounded bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
			>
				Cancel
			</a>
			<button
				type="submit"
				disabled={loading}
				class="rounded bg-irish-orange px-6 py-2 text-white transition-colors hover:bg-irish-orange-dark disabled:opacity-50"
			>
				{loading ? 'Creating...' : 'Create Event'}
			</button>
		</div>
	</form>
</div>