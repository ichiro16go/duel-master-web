/**
 * カードタイプ
 */
export type CardRarity = "common" | "uncommon" | "rare" | "super-rare"

export interface Card {
  id: string
  name: string
  cost: number // マナコスト
  power: number // パワー
  rarity: CardRarity
  type: "creature" | "spell" | "fortress"
  description: string
}

/**
 * プレイヤーの各ゾーン
 */
export interface PlayerZones {
  hand: Card[] // 手札
  deck: Card[] // デッキ
  graveyard: Card[] // 墓地
  manaZone: Card[] // マナゾーン
  battleZone: Card[] // バトルゾーン
  shieldZone: Card[] // シールドゾーン（最大4枚）
}

/**
 * プレイヤーの状態
 */
export interface PlayerState {
  id: string
  name: string
  shields: number // シールド数（0-4で敗北）
  zones: PlayerZones
  mana: number // 現在利用可能なマナ
  maxMana: number // ターン中の最大マナ
}

/**
 * ターンフェーズ
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
 * ゲーム状態
 */
export interface GameState {
  id: string
  players: [PlayerState, PlayerState] // 2人プレイヤー
  currentPlayerIndex: 0 | 1 // 現在のプレイヤーのインデックス
  currentPhase: TurnPhase
  turnCount: number // ゲーム開始からのターン数
  isGameOver: boolean
  winnerIndex: 0 | 1 | null // ゲーム終了時の勝者インデックス
  actionStack: GameAction[] // 実行待ちのアクション（S・トリガー対応）
}

/**
 * ゲーム内アクション
 */
export interface GameAction {
  id: string
  type: "play-card" | "attack" | "shield-trigger"
  playerId: string
  data: Record<string, any>
  timestamp: number
}

/**
 * マナ支払い検証結果
 */
export interface ManaCost {
  amount: number
  paymentCards: Card[]
  isValid: boolean
  errorMessage?: string
}
