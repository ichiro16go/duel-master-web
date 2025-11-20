<script lang="ts">
	import type { Card } from '$lib/types/card';

	interface Props {
		card: Card;
		isSmall?: boolean;
		showDetails?: boolean;
		onclick?: () => void;
	}

	let { card, isSmall = false, showDetails = false, onclick } = $props();

	function getPowerColor(power: number | undefined) {
		if (!power) return 'text-muted-foreground';
		if (power >= 10) return 'text-success';
		if (power >= 5) return 'text-accent';
		return 'text-muted-foreground';
	}
</script>

<button
	class={`relative rounded-lg border-2 transition-all hover:shadow-lg hover:shadow-primary/20 ${
		isSmall
			? 'h-24 w-20 border-border/50'
			: 'h-40 w-32 border-primary'
	} bg-gradient-to-b from-card to-card/50 p-2 text-left`}
	onclick={onclick}
>
	<!-- タップ状態表示 -->
	{#if card.tapped}
		<div class="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center">
			<div class="text-xl font-bold text-accent opacity-70">↻</div>
		</div>
	{/if}

	<!-- カード内容 -->
	<div class="flex h-full flex-col justify-between">
		<!-- ヘッダー -->
		<div>
			<div class="text-xs font-bold text-primary">{card.type}</div>
			<div class="line-clamp-2 text-xs font-semibold text-foreground">{card.name}</div>
		</div>

		<!-- 中央情報 -->
		{#if showDetails || !isSmall}
			<div class="flex items-center justify-between">
				<div class={`text-sm font-bold ${getPowerColor(card.power)}`}>
					{card.power || '-'}
				</div>
				<div class="text-xs text-accent">{card.cost}</div>
			</div>
		{/if}

		<!-- フッター -->
		<div class="text-right text-xs text-muted-foreground">{card.id}</div>
	</div>
</button>

<style>
	button:hover {
		@apply border-primary/80;
	}
</style>
