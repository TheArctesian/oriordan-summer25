<script lang="ts">
	export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	export let dismissible: boolean = false;

	let visible = true;

	const types = {
		success: 'bg-green-100 border-green-400 text-green-700',
		error: 'bg-red-100 border-red-400 text-red-700',
		warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
		info: 'bg-blue-100 border-blue-400 text-blue-700'
	};

	$: alertClasses = `border-l-4 p-4 rounded-lg ${types[type]}`;

	function dismiss() {
		visible = false;
	}
</script>

{#if visible}
	<div class={alertClasses} role="alert">
		<div class="flex items-start">
			<div class="flex-1">
				<slot />
			</div>
			{#if dismissible}
				<button
					on:click={dismiss}
					class="ml-4 text-lg font-semibold leading-none opacity-70 hover:opacity-100"
					aria-label="Dismiss"
				>
					×
				</button>
			{/if}
		</div>
	</div>
{/if}