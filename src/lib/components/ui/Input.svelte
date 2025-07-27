<script lang="ts">
	export let type: string = 'text';
	export let id: string;
	export let name: string = id;
	export let label: string;
	export let value: string | number = '';
	export let placeholder: string = '';
	export let required: boolean = false;
	export let disabled: boolean = false;
	export let error: string = '';

	const baseClasses = 'mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2';
	const normalClasses = 'border-gray-300 focus:border-irish-green focus:ring-irish-green';
	const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500';

	$: inputClasses = `${baseClasses} ${error ? errorClasses : normalClasses}`;
</script>

<div>
	<label for={id} class="block text-sm font-medium text-gray-700">
		{label}{#if required}*{/if}
	</label>
	<input
		{type}
		{id}
		{name}
		{placeholder}
		{required}
		{disabled}
		bind:value
		class={inputClasses}
		on:input
		on:change
		on:blur
	/>
	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div>