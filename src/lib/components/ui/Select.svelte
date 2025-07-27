<script lang="ts">
	export let id: string;
	export let name: string = id;
	export let label: string;
	export let value: string | number = '';
	export let required: boolean = false;
	export let disabled: boolean = false;
	export let error: string = '';
	export let options: Array<{ value: string | number; label: string }> = [];

	const baseClasses = 'mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2';
	const normalClasses = 'border-gray-300 focus:border-irish-green focus:ring-irish-green';
	const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500';

	$: selectClasses = `${baseClasses} ${error ? errorClasses : normalClasses}`;
</script>

<div>
	<label for={id} class="block text-sm font-medium text-gray-700">
		{label}{#if required}*{/if}
	</label>
	<select
		{id}
		{name}
		{required}
		{disabled}
		bind:value
		class={selectClasses}
		on:change
	>
		<slot name="default-option">
			<option value="">Select {label.toLowerCase()}</option>
		</slot>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
		<slot />
	</select>
	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div>