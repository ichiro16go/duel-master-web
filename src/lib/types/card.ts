/**
 * カードの状態フラグ
 * Replaced enum with const object for Svelte compatibility
 */
export const CardState = {
  IN_HAND: "in-hand",
  IN_DECK: "in-deck",
  IN_MANA_ZONE: "in-mana-zone",
  IN_BATTLE_ZONE: "in-battle-zone",
  IN_SHIELD_ZONE: "in-shield-zone",
  IN_GRAVEYARD: "in-graveyard",
  TAPPED: "tapped",
  ATTACKING: "attacking",
} as const

export type CardState = (typeof CardState)[keyof typeof CardState]

/**
 * カード本体の詳細情報
 */
export interface CardDetails {
  id: string
  name: string
  cost: number
  power: number
  rarity: "common" | "uncommon" | "rare" | "super-rare"
  type: "creature" | "spell" | "fortress"
  description: string
  abilityText: string
}

/**
 * ゲーム内のカードインスタンス
 */
export interface GameCard extends CardDetails {
  instanceId: string
  zone: CardState
  owner: string
  isTapped: boolean
  isAttacking: boolean
  damageOnCard: number
  canShieldTrigger: boolean
  createdTurn: number
}

/**
 * カードの移動イベント
 */
export interface CardMoveEvent {
  cardId: string
  fromZone: CardState
  toZone: CardState
  turn: number
  timestamp: number
}
