<script lang="ts">
	export let id: string;
	export let name: string = id;
	export let label: string;
	export let checked: boolean = false;
	export let disabled: boolean = false;
	export let error: string = '';

	const checkboxClasses = 'h-4 w-4 rounded border-gray-300 text-irish-green focus:ring-irish-green';
</script>

<div class="flex items-center">
	<input
		type="checkbox"
		{id}
		{name}
		{disabled}
		bind:checked
		class={checkboxClasses}
		on:change
	/>
	<label for={id} class="ml-2 block text-sm text-gray-700">
		{label}
	</label>
</div>
{#if error}
	<p class="mt-1 text-sm text-red-600">{error}</p>
{/if}