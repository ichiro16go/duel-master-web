import type { GameCard } from "$lib/types/card"

/**
 * S・トリガー状態
 * Replaced enum with const object for Svelte compatibility
 */
export const ShieldTriggerState = {
  IDLE: "idle",
  TRIGGERED: "triggered",
  RESOLVING: "resolving",
  RESOLVED: "resolved",
} as const

export type ShieldTriggerState = (typeof ShieldTriggerState)[keyof typeof ShieldTriggerState]

/**
 * S・トリガーイベント
 */
export interface ShieldTriggerEvent {
  id: string
  playerId: string
  shieldIndex: number
  triggeredCard: GameCard | null
  state: ShieldTriggerState
  canRespond: boolean
  timestamp: number
}

/**
 * S・トリガー解決スタック
 */
export interface ShieldTriggerStack {
  events: ShieldTriggerEvent[]
  currentEventIndex: number
  isPaused: boolean
}

/**
 * S・トリガー応答
 */
export interface ShieldTriggerResponse {
  playerId: string
  eventId: string
  action: "play-triggered-card" | "cast-spell" | "pass"
  cardId?: string
  timestamp: number
}

/**
 * シールドブレイク結果
 */
export interface ShieldBreakResult {
  success: boolean
  shieldIndex: number
  revealedCard: GameCard
  triggeredCard: GameCard | null
  playerReceivingShield: string
}
