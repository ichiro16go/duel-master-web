import type { Card } from "$lib/types/game"

/**
 * ターンフェーズの定義
 * Replaced enum with const object for Svelte compatibility
 */
export const TurnPhase = {
  START: "start",
  DRAW: "draw",
  MAIN: "main",
  ATTACK: "attack",
  END: "end",
} as const

export type TurnPhase = (typeof TurnPhase)[keyof typeof TurnPhase]

/**
 * ターン内のアクション
 */
export interface TurnAction {
  id: string
  playerId: string
  type: "play-card" | "attack" | "pass" | "shield-trigger"
  data: Record<string, any>
  timestamp: number
  resolved: boolean
}

/**
 * ターンの状態
 */
export interface TurnState {
  turnNumber: number
  currentPlayerIndex: 0 | 1
  currentPhase: TurnPhase
  actions: TurnAction[]
  cardsPlayedThisTurn: string[] // インスタンスID
  cardsAttackedThisTurn: string[] // インスタンスID
  manaSpentThisTurn: number
  phasePassed: boolean
}

/**
 * フェーズ実行結果
 */
export interface PhaseExecutionResult {
  success: boolean
  phase: TurnPhase
  nextPhase: TurnPhase | null
  messages: string[]
  cardsAffected: Card[]
  errors: string[]
}
