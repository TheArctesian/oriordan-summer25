<script lang="ts">
	export let headers: string[] = [];
	export let searchable: boolean = false;
	export let searchPlaceholder: string = 'Search...';
	export let searchValue: string = '';

	function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		searchValue = target.value;
	}
</script>

<div class="space-y-4">
	{#if searchable}
		<div class="flex justify-between items-center">
			<slot name="header" />
			<input
				type="text"
				placeholder={searchPlaceholder}
				value={searchValue}
				on:input={handleSearch}
				class="border border-irish-stone rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
			/>
		</div>
	{:else}
		<slot name="header" />
	{/if}

	<div class="overflow-x-auto rounded-lg border border-irish-stone shadow">
		<table class="min-w-full overflow-hidden bg-white">
			{#if headers.length}
				<thead class="bg-irish-navy text-white">
					<tr>
						{#each headers as header}
							<th class="px-4 py-3 text-left">{header}</th>
						{/each}
					</tr>
				</thead>
			{/if}
			<tbody class="divide-y divide-irish-stone">
				<slot />
			</tbody>
		</table>
	</div>

	<slot name="footer" />
</div>