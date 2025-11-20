import type { Card } from "$lib/types/game"

/**
 * 攻撃宣言
 */
export interface AttackDeclaration {
  attackerId: string
  defenderId: string | null
  timestamp: number
}

/**
 * ブロック宣言
 */
export interface BlockDeclaration {
  blockerId: string
  attackerId: string
  timestamp: number
}

/**
 * バトルの結果
 */
export interface BattleResult {
  attacker: Card
  defender: Card | null
  attackerDamage: number
  defenderDamage: number
  isPlayerAttack: boolean
  shieldsDestroyed: number // ライフの代わりにシールド破壊数
  creaturiesDestroyed: Card[]
  winner: "attacker" | "defender" | "both-destroyed" | null
}

/**
 * バトル進行状況
 */
export interface BattlePhaseState {
  attacks: AttackDeclaration[]
  blocks: BlockDeclaration[]
  resolvedBattles: BattleResult[]
  pendingBattles: AttackDeclaration[]
}
