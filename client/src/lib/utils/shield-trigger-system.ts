import type { GameCard } from "$lib/types/card"
import type {
  ShieldTriggerEvent,
  ShieldTriggerStack,
  ShieldTriggerResponse,
  ShieldBreakResult,
  ShieldTriggerState,
} from "$lib/types/shield-trigger"

/**
 * S・トリガースタックを初期化
 */
export function initializeShieldTriggerStack(): ShieldTriggerStack {
  return {
    events: [],
    currentEventIndex: 0,
    isPaused: false,
  }
}

/**
 * シールドブレイク時にS・トリガーをチェック
 */
export function checkShieldBreak(
  shieldZone: GameCard[],
  shieldIndex: number,
  defendingPlayerId: string,
): ShieldBreakResult {
  if (shieldIndex < 0 || shieldIndex >= shieldZone.length) {
    throw new Error("無効なシールドインデックス")
  }

  const revealedCard = shieldZone[shieldIndex]

  // S・トリガー判定：「shield」テキストを持つカード
  const hasShieldTrigger = revealedCard.description.toLowerCase().includes("shield")
  const triggeredCard = hasShieldTrigger ? revealedCard : null

  return {
    success: true,
    shieldIndex,
    revealedCard,
    triggeredCard,
    playerReceivingShield: defendingPlayerId,
  }
}

/**
 * S・トリガーイベントを作成
 */
export function createShieldTriggerEvent(
  playerId: string,
  shieldIndex: number,
  triggeredCard: GameCard | null,
): ShieldTriggerEvent {
  return {
    id: `shield-trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    playerId,
    shieldIndex,
    triggeredCard,
    state: "triggered" as ShieldTriggerState,
    canRespond: triggeredCard !== null,
    timestamp: Date.now(),
  }
}

/**
 * S・トリガーイベントをスタックに追加
 */
export function pushShieldTriggerEvent(stack: ShieldTriggerStack, event: ShieldTriggerEvent): ShieldTriggerStack {
  return {
    ...stack,
    events: [...stack.events, event],
  }
}

/**
 * 次のS・トリガーイベントを取得
 */
export function getNextShieldTriggerEvent(stack: ShieldTriggerStack): ShieldTriggerEvent | null {
  if (stack.currentEventIndex >= stack.events.length) {
    return null
  }

  return stack.events[stack.currentEventIndex]
}

/**
 * S・トリガーイベントを解決
 */
export function resolveShieldTriggerEvent(
  stack: ShieldTriggerStack,
  eventId: string,
  response: ShieldTriggerResponse,
): ShieldTriggerStack {
  const updatedEvents = stack.events.map((event) => {
    if (event.id === eventId) {
      return {
        ...event,
        state: "resolved" as ShieldTriggerState,
      }
    }
    return event
  })

  return {
    ...stack,
    events: updatedEvents,
    currentEventIndex: stack.currentEventIndex + 1,
  }
}

/**
 * トリガーしたカードを手札に返す
 */
export function playTriggeredShieldCard(allCards: GameCard[], triggeredCard: GameCard): GameCard[] {
  return allCards.map((card) => {
    if (card.instanceId === triggeredCard.instanceId) {
      return {
        ...card,
        zone: "in-hand" as any,
      }
    }
    return card
  })
}

/**
 * S・トリガースタック内の全イベントをチェック
 */
export function hasUnresolvedShieldTriggers(stack: ShieldTriggerStack): boolean {
  return stack.currentEventIndex < stack.events.length
}

/**
 * S・トリガースタックをリセット
 */
export function resetShieldTriggerStack(): ShieldTriggerStack {
  return initializeShieldTriggerStack()
}

/**
 * 複数シールドの一括ブレイク処理（最初にバトルで複数ブレイクされる場合）
 */
export function batchShieldBreak(
  shieldZone: GameCard[],
  breakCount: number,
  defendingPlayerId: string,
): {
  results: ShieldBreakResult[]
  stack: ShieldTriggerStack
} {
  const results: ShieldBreakResult[] = []
  let stack = initializeShieldTriggerStack()

  for (let i = 0; i < breakCount && i < shieldZone.length; i++) {
    const result = checkShieldBreak(shieldZone, i, defendingPlayerId)
    results.push(result)

    if (result.triggeredCard) {
      const event = createShieldTriggerEvent(defendingPlayerId, i, result.triggeredCard)
      stack = pushShieldTriggerEvent(stack, event)
    }
  }

  return { results, stack }
}

/**
 * シールド処理の詳細ログを生成
 */
export function generateShieldBreakLog(result: ShieldBreakResult, event: ShieldTriggerEvent | null): string {
  let log = `【シールドブレイク】\n`
  log += `シールド位置: ${result.shieldIndex + 1}\n`
  log += `公開されたカード: ${result.revealedCard.name}\n`

  if (event && event.triggeredCard) {
    log += `🔥 S・トリガー発動！\n`
    log += `トリガーカード: ${event.triggeredCard.name}\n`
    log += `→ 手札に加わります\n`
  } else {
    log += `S・トリガーなし`
  }

  return log
}

/**
 * S・トリガー応答タイムアウト時の自動処理
 */
export function autoPassShieldTrigger(stack: ShieldTriggerStack): ShieldTriggerStack {
  const currentEvent = getNextShieldTriggerEvent(stack)

  if (!currentEvent) {
    return stack
  }

  const response: ShieldTriggerResponse = {
    playerId: currentEvent.playerId,
    eventId: currentEvent.id,
    action: "pass",
    timestamp: Date.now(),
  }

  return resolveShieldTriggerEvent(stack, currentEvent.id, response)
}

/**
 * S・トリガー割り込みが可能な状態かを判定
 */
export function canInterruptWithShieldTrigger(stack: ShieldTriggerStack, playerId: string): boolean {
  const currentEvent = getNextShieldTriggerEvent(stack)

  if (!currentEvent) {
    return false
  }

  if (!currentEvent.canRespond) {
    return false
  }

  // プレイヤーが防御側である必要がある
  if (currentEvent.playerId !== playerId) {
    return false
  }

  return true
}

/**
 * S・トリガーチェーン（複数のS・トリガー同時発動）の解決順序を管理
 */
export function resolveShieldTriggerChain(stack: ShieldTriggerStack): {
  chainLength: number
  allTriggered: boolean
  nextEvent: ShieldTriggerEvent | null
} {
  const unresolvedEvents = stack.events.filter((e) => e.state !== "resolved")

  return {
    chainLength: unresolvedEvents.length,
    allTriggered: unresolvedEvents.every((e) => e.triggeredCard !== null),
    nextEvent: unresolvedEvents[0] || null,
  }
}

/**
 * S・トリガーログ履歴を取得
 */
export function getShieldTriggerHistory(
  stack: ShieldTriggerStack,
): Array<{ event: ShieldTriggerEvent; resolvedAt: number }> {
  const resolvedEvents = stack.events.filter((e) => e.state === "resolved")

  return resolvedEvents.map((event, index) => ({
    event,
    resolvedAt: stack.events.indexOf(event),
  }))
}
