<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'danger' | 'cancel' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled: boolean = false;
	export let href: string | undefined = undefined;
	export let type: 'button' | 'submit' | 'reset' = 'button';

	const baseClasses = 'font-medium transition-colors rounded focus:outline-none focus:ring-2 focus:ring-offset-2';
	
	const variants = {
		primary: 'bg-irish-green text-white hover:bg-irish-green-dark focus:ring-irish-green',
		secondary: 'bg-irish-navy text-white hover:bg-irish-navy-light focus:ring-irish-navy',
		danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
		cancel: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500'
	};

	const sizes = {
		sm: 'px-3 py-1 text-sm',
		md: 'px-4 py-2',
		lg: 'px-6 py-3 text-lg'
	};

	$: classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`.trim();
</script>

{#if href}
	<a {href} class={classes} role="button" aria-disabled={disabled}>
		<slot />
	</a>
{:else}
	<button {type} {disabled} class={classes} on:click>
		<slot />
	</button>
{/if}