<script lang="ts">
	import type { GameState } from '$lib/types/game';

	let { gameState } = $props();

	const player1BattleZone = gameState.players[1].zones.battleZone || [];
	const player0BattleZone = gameState.players[0].zones.battleZone || [];
</script>

<div class="flex flex-col gap-8">
	<!-- 相手のバトルゾーン -->
	<div class="zone-container min-h-40 min-w-96">
		<div class="mb-2 text-xs font-semibold text-muted-foreground">相手のバトルゾーン</div>
		<div class="flex flex-wrap gap-3">
			{#if player1BattleZone.length === 0}
				<div class="flex h-40 w-full items-center justify-center text-muted-foreground">
					クリーチャーはいません
				</div>
			{:else}
				{#each player1BattleZone as card (card.id)}
					<div class="relative">
						<div
							class="h-40 w-32 rounded-lg border-2 border-accent bg-gradient-to-b from-secondary to-secondary/50 p-2 text-center text-xs text-foreground"
						>
							<div class="font-bold">{card.name}</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- 自分のバトルゾーン -->
	<div class="zone-container min-h-40 min-w-96">
		<div class="mb-2 text-xs font-semibold text-muted-foreground">自分のバトルゾーン</div>
		<div class="flex flex-wrap gap-3">
			{#if player0BattleZone.length === 0}
				<div class="flex h-40 w-full items-center justify-center text-muted-foreground">
					クリーチャーはいません
				</div>
			{:else}
				{#each player0BattleZone as card (card.id)}
					<div class="relative">
						<div
							class="h-40 w-32 rounded-lg border-2 border-primary bg-gradient-to-b from-primary to-primary/50 p-2 text-center text-xs text-primary-foreground"
						>
							<div class="font-bold">{card.name}</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
