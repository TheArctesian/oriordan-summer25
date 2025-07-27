<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const accommodationId = $page.params.id;

	let form = {
		name: '',
		address: '',
		capacity: '',
		notes: ''
	};

	let loading = false;
	let loadingData = true;
	let error = '';

	onMount(async () => {
		try {
			const response = await fetch('/api/admin/accommodations');
			const accommodations = await response.json();
			const accommodation = accommodations.find((a) => a.id.toString() === accommodationId);

			if (!accommodation) {
				throw new Error('Accommodation not found');
			}

			form = { ...accommodation };
			loadingData = false;
		} catch (err) {
			error = err.message;
			loadingData = false;
		}
	});

	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/admin/accommodations', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: parseInt(accommodationId), ...form })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update accommodation');
			}

			goto('/admin/accommodations');
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-irish-navy">Edit Accommodation</h1>
		<a
			href="/admin/accommodations"
			class="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
		>
			Cancel
		</a>
	</div>

	{#if loadingData}
		<div class="py-8 text-center">
			<p class="text-irish-navy-light">Loading accommodation data...</p>
		</div>
	{:else if error}
		<div class="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
			{error}
		</div>
	{:else}
		<form on:submit|preventDefault={handleSubmit} class="rounded-lg bg-white p-6 shadow">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700">Name*</label>
					<input
						type="text"
						id="name"
						bind:value={form.name}
						required
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
					/>
				</div>

				<div>
					<label for="capacity" class="block text-sm font-medium text-gray-700">Capacity</label>
					<input
						type="text"
						id="capacity"
						bind:value={form.capacity}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
					/>
				</div>
			</div>

			<div class="mt-6">
				<label for="address" class="block text-sm font-medium text-gray-700">Address</label>
				<textarea
					id="address"
					bind:value={form.address}
					rows="3"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				></textarea>
			</div>

			<div class="mt-6">
				<label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
				<textarea
					id="notes"
					bind:value={form.notes}
					rows="4"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-irish-green focus:outline-none focus:ring-irish-green"
				></textarea>
			</div>

			<div class="mt-8 flex justify-end gap-4">
				<a
					href="/admin/accommodations"
					class="rounded bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
				>
					Cancel
				</a>
				<button
					type="submit"
					disabled={loading}
					class="rounded bg-irish-navy px-6 py-2 text-white transition-colors hover:bg-irish-navy-light disabled:opacity-50"
				>
					{loading ? 'Updating...' : 'Update Accommodation'}
				</button>
			</div>
		</form>
	{/if}
</div>