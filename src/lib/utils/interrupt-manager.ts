import type { GameState } from "$lib/types/game"
import type { ShieldTriggerStack } from "$lib/types/shield-trigger"

/**
 * 割り込みスタック（S・トリガーと呼応できるアクション）
 */
export interface InterruptStack {
  mainAction: string
  interruptLayers: Array<{
    playerId: string
    action: string
    cardId?: string
    timestamp: number
  }>
  isResolving: boolean
}

/**
 * 割り込みスタックを初期化
 */
export function initializeInterruptStack(mainAction: string): InterruptStack {
  return {
    mainAction,
    interruptLayers: [],
    isResolving: false,
  }
}

/**
 * 割り込みを追加
 */
export function addInterrupt(stack: InterruptStack, playerId: string, action: string, cardId?: string): InterruptStack {
  return {
    ...stack,
    interruptLayers: [
      ...stack.interruptLayers,
      {
        playerId,
        action,
        cardId,
        timestamp: Date.now(),
      },
    ],
  }
}

/**
 * 割り込みを実行（LIFO: Last In First Out）
 */
export function resolveInterruptStack(stack: InterruptStack): {
  resolutionOrder: typeof stack.interruptLayers
  mainActionExecutes: boolean
} {
  // スタックをリバースして実行順序を取得（最後に追加されたものが先に実行）
  const resolutionOrder = [...stack.interruptLayers].reverse()

  return {
    resolutionOrder,
    mainActionExecutes: resolutionOrder.length > 0,
  }
}

/**
 * 割り込み可能なアクションかを判定
 */
export function isInterruptible(actionType: string): boolean {
  const interruptibleActions = ["play-card", "attack", "shield-break", "damage-assignment"]

  return interruptibleActions.includes(actionType)
}

/**
 * 現在のゲーム状態で割り込み可能かを判定
 */
export function canPlayerInterrupt(
  gameState: GameState,
  playerId: string,
  shieldTriggerStack: ShieldTriggerStack,
): boolean {
  // 防御プレイヤーのみ割り込み可能
  const defendingPlayerIndex = (gameState.currentPlayerIndex + 1) % 2
  const defendingPlayerId = gameState.players[defendingPlayerIndex].id

  if (playerId !== defendingPlayerId) {
    return false
  }

  // S・トリガーが発動している必要がある
  const hasUnresolvedTrigger = shieldTriggerStack.events.some((e) => e.state === "triggered")

  return hasUnresolvedTrigger
}

/**
 * 割り込みスタックをクリア
 */
export function clearInterruptStack(): InterruptStack {
  return {
    mainAction: "",
    interruptLayers: [],
    isResolving: false,
  }
}

/**
 * 割り込み解決の詳細ログを生成
 */
export function generateInterruptResolutionLog(stack: InterruptStack): string {
  let log = `【割り込み解決順序】\n`
  log += `メインアクション: ${stack.mainAction}\n`

  if (stack.interruptLayers.length === 0) {
    log += `割り込みなし\n`
  } else {
    const { resolutionOrder } = resolveInterruptStack(stack)
    log += `割り込み数: ${resolutionOrder.length}\n\n`

    resolutionOrder.forEach((layer, index) => {
      log += `${index + 1}. ${layer.action} (プレイヤー: ${layer.playerId})\n`
      if (layer.cardId) {
        log += `   カードID: ${layer.cardId}\n`
      }
    })
  }

  return log
}
