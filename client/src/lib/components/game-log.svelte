<script lang="ts">
	interface LogEntry {
		id: string;
		message: string;
		type: 'info' | 'action' | 'warning' | 'error';
		timestamp: Date;
	}

	interface Props {
		logs?: LogEntry[];
	}

	let { logs = [] } = $props();

	let showLogs = $state(false);

	function getLogColor(type: string): string {
		switch (type) {
			case 'action':
				return 'text-primary';
			case 'warning':
				return 'text-accent';
			case 'error':
				return 'text-destructive';
			default:
				return 'text-foreground';
		}
	}
</script>

<div class="fixed right-4 top-20 z-10 max-h-96 w-80">
	<button
		class="mb-2 w-full rounded-lg bg-card border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-card/80"
		onclick={() => (showLogs = !showLogs)}
	>
		{showLogs ? 'ログを閉じる' : 'ゲームログ'}
	</button>

	{#if showLogs}
		<div class="max-h-80 overflow-y-auto rounded-lg border border-border bg-card/50 p-3 backdrop-blur-sm">
			{#if logs.length === 0}
				<div class="text-xs text-muted-foreground">ログはありません</div>
			{:else}
				<div class="flex flex-col gap-2">
					{#each logs as log (log.id)}
						<div class={`text-xs ${getLogColor(log.type)}`}>
							<span class="text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
							<span>{log.message}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
