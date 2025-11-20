<script lang="ts">
	import type { PlayerState } from '$lib/types/game';

	interface Props {
		player: PlayerState;
		isCurrentPlayer: boolean;
		isOpponent: boolean;
	}

	let { player, isCurrentPlayer, isOpponent } = $props();
</script>

<div
	class={`zone-container h-full ${isCurrentPlayer ? 'border-accent' : 'border-border'}`}
>
	<!-- プレイヤー情報ヘッダー -->
	<div class="mb-4 flex items-center justify-between">
		<div>
			<h2 class="text-lg font-bold text-foreground">
				{isOpponent ? '相手' : 'あなた'}
			</h2>
			<div class="text-xs text-muted-foreground">Player {isOpponent ? '2' : '1'}</div>
		</div>
		{#if isCurrentPlayer}
			<div class="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
				ターン中
			</div>
		{/if}
	</div>

	<!-- ライフ表示 -->
	<div class="mb-6 rounded-lg bg-card/50 p-3">
		<div class="flex items-baseline gap-2">
			<span class="text-sm text-muted-foreground">ライフ:</span>
			<span class="text-3xl font-bold text-success">{player.life}</span>
			<span class="text-xs text-muted-foreground">/ {player.maxLife}</span>
		</div>
		<div class="mt-2 h-2 overflow-hidden rounded-full bg-muted">
			<div
				class="h-full bg-gradient-to-r from-success to-success/70"
				style="width: {(player.life / player.maxLife) * 100}%"
			></div>
		</div>
	</div>

	<!-- ゾーン情報 -->
	<div class="grid grid-cols-2 gap-3 text-sm">
		<div class="rounded-lg bg-card/50 p-3">
			<div class="text-xs text-muted-foreground">マナ</div>
			<div class="mt-1 text-lg font-bold text-primary">
				{player.mana} / {player.maxMana}
			</div>
		</div>

		<div class="rounded-lg bg-card/50 p-3">
			<div class="text-xs text-muted-foreground">手札</div>
			<div class="mt-1 text-lg font-bold text-accent">
				{player.zones.hand.length} 枚
			</div>
		</div>

		<div class="rounded-lg bg-card/50 p-3">
			<div class="text-xs text-muted-foreground">デッキ</div>
			<div class="mt-1 text-lg font-bold text-secondary">
				{player.zones.deck.length} 枚
			</div>
		</div>

		<div class="rounded-lg bg-card/50 p-3">
			<div class="text-xs text-muted-foreground">墓地</div>
			<div class="mt-1 text-lg font-bold text-destructive">
				{player.zones.graveyard.length} 枚
			</div>
		</div>
	</div>

	<!-- シールド表示 -->
	<div class="mt-4">
		<div class="mb-2 text-xs font-semibold text-muted-foreground">シールドゾーン</div>
		<div class="flex gap-2">
			{#each Array.from({ length: 5 }) as _, i}
				<div
					class={`flex h-20 w-16 items-center justify-center rounded-lg border-2 font-bold ${
						i < player.zones.shieldZone.length
							? 'border-accent bg-accent/10 text-accent'
							: 'border-muted bg-muted/10 text-muted-foreground'
					}`}
				>
					{#if i < player.zones.shieldZone.length}
						S{i + 1}
					{:else}
						-
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
