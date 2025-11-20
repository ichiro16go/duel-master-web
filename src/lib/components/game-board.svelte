<script lang="ts">
	import type { GameState } from '$lib/types/game';
	import PlayerArea from './player-area.svelte';
	import BattleZone from './battle-zone.svelte';
	import GameHeader from './game-header.svelte';

	let { gameState = $bindable() } = $props();
</script>

<div class="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
	<!-- ゲームヘッダー -->
	<GameHeader {gameState} />

	<!-- メインゲームボード -->
	<div class="flex flex-1 gap-4 p-4">
		<!-- 相手プレイヤーエリア -->
		<div class="flex-1">
			<PlayerArea
				player={gameState.players[1]}
				isCurrentPlayer={gameState.currentPlayerIndex === 1}
				isOpponent={true}
			/>
		</div>

		<!-- 中央バトルゾーン -->
		<div class="flex flex-1 flex-col items-center justify-center">
			<BattleZone {gameState} />
		</div>

		<!-- 自分プレイヤーエリア -->
		<div class="flex-1">
			<PlayerArea
				player={gameState.players[0]}
				isCurrentPlayer={gameState.currentPlayerIndex === 0}
				isOpponent={false}
			/>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
