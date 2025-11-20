<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { GameState } from '$lib/types/game';
	
	let { gameState, onAction }: { gameState: GameState; onAction: (action: string, payload?: any) => void } = $props();
	
	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	
	// UI状態
	let manaZoneOpen = $state(false);
	let graveyardOpen = $state(false);
	let selectedCardId = $state<string | null>(null);

	// Canvas 描画用の座標情報をキャッシュ
	let uiElements = $state<Array<{ type: string; bounds: DOMRect; action: () => void }>>([]);

	onMount(async () => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			drawGameBoard(ctx);
		};

		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);

		canvas.addEventListener('click', (e) => handleCanvasClick(e, canvas));

		console.log('[v0] Game Board initialized');

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			canvas.removeEventListener('click', handleCanvasClick);
		};
	});

	function handleCanvasClick(e: MouseEvent, canvasElement: HTMLCanvasElement) {
		const rect = canvasElement.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const h = canvasElement.height;

		// マナゾーン（左下の円形）
		const manaX = 80;
		const manaY = h - 200;
		const manaDist = Math.sqrt((x - manaX) ** 2 + (y - manaY) ** 2);
		if (manaDist < 60) {
			manaZoneOpen = !manaZoneOpen;
			graveyardOpen = false;
			return;
		}

		// 墓地ボタン（マナゾーン上）
		const graveyardX = 80;
		const graveyardY = h - 300;
		if (x > graveyardX - 40 && x < graveyardX + 40 && y > graveyardY - 40 && y < graveyardY + 40) {
			graveyardOpen = !graveyardOpen;
			manaZoneOpen = false;
			return;
		}

		// バトルゾーン内のクリーチャーカード
		const w = canvasElement.width;
		const centerX = w / 2;
		const spacing = 100;
		const cardWidth = 80;
		const cardHeight = 120;

		// 相手バトルゾーン
		const opponentBattleY = 250;
		for (let i = 0; i < Math.min(gameState.players[1].zones.battleZone.length, 5); i++) {
			const cardX = centerX - (2 * spacing) + i * spacing;
			if (x > cardX - cardWidth / 2 && x < cardX + cardWidth / 2 && 
			    y > opponentBattleY - cardHeight / 2 && y < opponentBattleY + cardHeight / 2) {
				selectedCardId = gameState.players[1].zones.battleZone[i].id;
				return;
			}
		}

		// 自分バトルゾーン
		const playerBattleY = h - 350;
		for (let i = 0; i < Math.min(gameState.players[0].zones.battleZone.length, 5); i++) {
			const cardX = centerX - (2 * spacing) + i * spacing;
			if (x > cardX - cardWidth / 2 && x < cardX + cardWidth / 2 && 
			    y > playerBattleY - cardHeight / 2 && y < playerBattleY + cardHeight / 2) {
				selectedCardId = gameState.players[0].zones.battleZone[i].id;
				return;
			}
		}

		// シールドゾーンのクリック
		const shieldSpacing = 80;
		
		// 相手シールドゾーン（上部）
		const opponentShieldY = 100;
		for (let i = 0; i < 5; i++) {
			const shieldX = centerX - (2 * shieldSpacing) + i * shieldSpacing;
			const dist = Math.sqrt((x - shieldX) ** 2 + (y - opponentShieldY) ** 2);
			if (dist < 35) {
				onAction('attackShield', { targetShield: i, isOpponent: true });
				return;
			}
		}

		// 自分シールドゾーン（下部）
		const playerShieldY = h - 200;
		for (let i = 0; i < 5; i++) {
			const shieldX = centerX - (2 * shieldSpacing) + i * shieldSpacing;
			const dist = Math.sqrt((x - shieldX) ** 2 + (y - playerShieldY) ** 2);
			if (dist < 35) {
				onAction('defendShield', { targetShield: i });
				return;
			}
		}
	}

	function drawGameBoard(ctx: CanvasRenderingContext2D) {
		const w = canvas.width;
		const h = canvas.height;

		// 背景
		ctx.fillStyle = '#0a1f2e';
		ctx.fillRect(0, 0, w, h);

		// グリッド
		drawBackgroundGrid(ctx);

		// マナゾーン（左下）
		drawManaZone(ctx, 80, h - 200);

		// 墓地ボタン（マナゾーン上）
		drawGraveyardButton(ctx, 80, h - 300);

		// 相手シールドゾーン（上部）
		drawShieldZone(ctx, true, w / 2, 100);

		// 相手バトルゾーン（上部中央）
		drawBattleZone(ctx, true, w / 2, 250);

		// 自分バトルゾーン（下部中央）
		drawBattleZone(ctx, false, w / 2, h - 350);

		// 自分シールドゾーン（下部）
		drawShieldZone(ctx, false, w / 2, h - 200);

		// 相手手札枚数（上部右）
		drawHandZone(ctx, true, w - 150, 50);

		// 自分手札枚数（下部右）
		drawHandZone(ctx, false, w - 150, h - 120);
	}

	function drawBackgroundGrid(ctx: CanvasRenderingContext2D) {
		const gridSize = 50;
		const w = canvas.width;
		const h = canvas.height;

		ctx.strokeStyle = '#1a3a4a';
		ctx.lineWidth = 1;

		for (let x = 0; x < w; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, h);
			ctx.stroke();
		}

		for (let y = 0; y < h; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(w, y);
			ctx.stroke();
		}
	}

	function drawManaZone(ctx: CanvasRenderingContext2D, x: number, y: number) {
		const size = 120;
		const player = gameState.players[0];

		// 円形背景
		ctx.fillStyle = 'rgba(0, 168, 255, 0.2)';
		ctx.strokeStyle = '#00a8ff';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(x, y, size / 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// テキスト
		ctx.fillStyle = '#00a8ff';
		ctx.font = '16px Arial';
		ctx.textAlign = 'center';
		ctx.fillText(`マナ`, x, y - 8);
		ctx.font = 'bold 24px Arial';
		ctx.fillText(`${player.mana}/${player.maxMana}`, x, y + 12);
	}

	function drawGraveyardButton(ctx: CanvasRenderingContext2D, x: number, y: number) {
		const size = 80;
		const player = gameState.players[0];

		ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
		ctx.strokeStyle = '#ff6b35';
		ctx.lineWidth = 2;
		ctx.fillRect(x - size / 2, y - size / 2, size, size);
		ctx.strokeRect(x - size / 2, y - size / 2, size, size);

		ctx.fillStyle = '#ff6b35';
		ctx.font = '14px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('墓地', x, y - 8);
		ctx.font = 'bold 16px Arial';
		ctx.fillText(`${player.zones.graveyard.length}`, x, y + 12);
	}

	function drawShieldZone(ctx: CanvasRenderingContext2D, isOpponent: boolean, centerX: number, centerY: number) {
		const player = gameState.players[isOpponent ? 1 : 0];
		const shieldCount = player.zones.shieldZone.length;
		const spacing = 80;

		for (let i = 0; i < 5; i++) {
			const x = centerX - (2 * spacing) + i * spacing;
			const shieldColor = i < shieldCount ? '#00d4ff' : '#334455';
			const alpha = i < shieldCount ? 0.4 : 0.2;

			// シールド形状（六角形）
			ctx.fillStyle = shieldColor.replace('#', 'rgba(') + `, ${alpha})`;
			ctx.strokeStyle = shieldColor;
			ctx.lineWidth = 2;

			drawHexagon(ctx, x, centerY, 30);
			ctx.fill();
			ctx.stroke();

			if (i < shieldCount) {
				ctx.fillStyle = '#00d4ff';
				ctx.font = 'bold 12px Arial';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(`S${i + 1}`, x, centerY);
			}
		}
	}

	function drawBattleZone(ctx: CanvasRenderingContext2D, isOpponent: boolean, centerX: number, centerY: number) {
		const player = gameState.players[isOpponent ? 1 : 0];
		const creatures = player.zones.battleZone;
		const cardWidth = 80;
		const cardHeight = 120;
		const spacing = 100;

		for (let i = 0; i < Math.min(creatures.length, 5); i++) {
			const x = centerX - (2 * spacing) + i * spacing;
			const creature = creatures[i];

			ctx.fillStyle = 'rgba(74, 144, 226, 0.6)';
			ctx.strokeStyle = '#00d4ff';
			ctx.lineWidth = 2;
			ctx.fillRect(x - cardWidth / 2, centerY - cardHeight / 2, cardWidth, cardHeight);
			ctx.strokeRect(x - cardWidth / 2, centerY - cardHeight / 2, cardWidth, cardHeight);

			ctx.fillStyle = '#ffffff';
			ctx.font = '10px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(creature.name.substring(0, 8), x, centerY - 20);

			ctx.fillStyle = '#ffff00';
			ctx.font = 'bold 16px Arial';
			ctx.fillText(creature.power.toString(), x, centerY + 30);
		}
	}

	function drawHandZone(ctx: CanvasRenderingContext2D, isOpponent: boolean, x: number, y: number) {
		const player = gameState.players[isOpponent ? 1 : 0];
		const handCount = player.zones.hand.length;

		ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
		ctx.strokeStyle = '#8b5cf6';
		ctx.lineWidth = 2;
		ctx.fillRect(x - 50, y - 20, 100, 40);
		ctx.strokeRect(x - 50, y - 20, 100, 40);

		ctx.fillStyle = '#8b5cf6';
		ctx.font = '12px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(`手札: ${handCount}`, x, y);
	}

	function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const angle = (i * Math.PI) / 3;
			const hx = x + size * Math.cos(angle);
			const hy = y + size * Math.sin(angle);
			if (i === 0) ctx.moveTo(hx, hy);
			else ctx.lineTo(hx, hy);
		}
		ctx.closePath();
	}

	onDestroy(() => {
		// cleanup
	});
</script>

<div bind:this={container} class="w-full h-screen bg-slate-950 flex flex-col">
	<canvas bind:this={canvas} class="flex-1 cursor-pointer"></canvas>

	{#if manaZoneOpen}
		<div class="fixed left-4 bottom-24 bg-slate-900 border-2 border-blue-500 rounded-lg p-4 w-64 max-h-80 overflow-y-auto">
			<h3 class="text-blue-400 font-bold mb-3">マナゾーン</h3>
			<div class="space-y-2">
				{#each gameState.players[0].zones.manaZone as card (card.id)}
					<div class="bg-slate-800 p-2 rounded text-xs text-gray-300">
						<div class="font-semibold">{card.name}</div>
						<div>コスト: {card.cost}</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if graveyardOpen}
		<div class="fixed left-4 top-40 bg-slate-900 border-2 border-orange-500 rounded-lg p-4 w-64 max-h-80 overflow-y-auto">
			<h3 class="text-orange-400 font-bold mb-3">墓地</h3>
			<div class="space-y-2">
				{#each gameState.players[0].zones.graveyard as card (card.id)}
					<div class="bg-slate-800 p-2 rounded text-xs text-gray-300">
						<div class="font-semibold">{card.name}</div>
						<div>コスト: {card.cost}</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
