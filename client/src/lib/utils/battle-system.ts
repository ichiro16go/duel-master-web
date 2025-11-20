import type { GameCard } from "$lib/types/card"
import type { BattleResult, BattlePhaseState } from "$lib/types/battle"

/**
 * バトルフェーズ状態を初期化
 */
export function initializeBattlePhase(): BattlePhaseState {
  return {
    attacks: [],
    blocks: [],
    resolvedBattles: [],
    pendingBattles: [],
  }
}

/**
 * 攻撃可能なクリーチャーかをチェック
 */
export function canAttack(card: GameCard, turnCreated: number, currentTurn: number): boolean {
  if (card.type !== "creature") return false
  if (card.isTapped) return false
  if (card.isAttacking) return false
  if (card.zone !== "in-battle-zone") return false

  // 配置されたターンの同じターンには攻撃できない（一般的なルール）
  if (card.createdTurn === currentTurn) return false

  return true
}

/**
 * ブロック可能なクリーチャーかをチェック
 */
export function canBlock(card: GameCard): boolean {
  if (card.type !== "creature") return false
  if (card.isTapped) return false
  if (card.zone !== "in-battle-zone") return false

  return true
}

/**
 * 攻撃を宣言
 */
export function declareAttack(
  battleState: BattlePhaseState,
  attacker: GameCard,
  defenderId: string | null,
  allCards: GameCard[],
): {
  success: boolean
  updatedBattleState: BattlePhaseState
  message: string
  error?: string
} {
  if (!canAttack(attacker, attacker.createdTurn, 0)) {
    return {
      success: false,
      updatedBattleState: battleState,
      message: "",
      error: `${attacker.name}は攻撃できません`,
    }
  }

  // 直接攻撃の場合のチェック
  if (defenderId === null) {
    return {
      success: true,
      updatedBattleState: {
        ...battleState,
        attacks: [
          ...battleState.attacks,
          {
            attackerId: attacker.instanceId,
            defenderId: null,
            timestamp: Date.now(),
          },
        ],
        pendingBattles: [
          ...battleState.pendingBattles,
          {
            attackerId: attacker.instanceId,
            defenderId: null,
            timestamp: Date.now(),
          },
        ],
      },
      message: `${attacker.name}がプレイヤーに攻撃を宣言しました`,
    }
  }

  // ブロック対象クリーチャーが存在するかチェック
  const defender = allCards.find((c) => c.instanceId === defenderId)
  if (!defender) {
    return {
      success: false,
      updatedBattleState: battleState,
      message: "",
      error: "ブロック対象のクリーチャーが見つかりません",
    }
  }

  return {
    success: true,
    updatedBattleState: {
      ...battleState,
      attacks: [
        ...battleState.attacks,
        {
          attackerId: attacker.instanceId,
          defenderId,
          timestamp: Date.now(),
        },
      ],
      pendingBattles: [
        ...battleState.pendingBattles,
        {
          attackerId: attacker.instanceId,
          defenderId,
          timestamp: Date.now(),
        },
      ],
    },
    message: `${attacker.name}が${defender.name}に攻撃を宣言しました`,
  }
}

/**
 * ブロックを宣言
 */
export function declareBlock(
  battleState: BattlePhaseState,
  blocker: GameCard,
  attackerId: string,
  allCards: GameCard[],
): {
  success: boolean
  updatedBattleState: BattlePhaseState
  message: string
  error?: string
} {
  if (!canBlock(blocker)) {
    return {
      success: false,
      updatedBattleState: battleState,
      message: "",
      error: `${blocker.name}はブロックできません`,
    }
  }

  // 攻撃クリーチャーが存在するかチェック
  const attacker = allCards.find((c) => c.instanceId === attackerId)
  if (!attacker) {
    return {
      success: false,
      updatedBattleState: battleState,
      message: "",
      error: "攻撃クリーチャーが見つかりません",
    }
  }

  return {
    success: true,
    updatedBattleState: {
      ...battleState,
      blocks: [
        ...battleState.blocks,
        {
          blockerId: blocker.instanceId,
          attackerId,
          timestamp: Date.now(),
        },
      ],
    },
    message: `${blocker.name}が${attacker.name}をブロック`,
  }
}

/**
 * バトルを解決（ダメージ計算）
 */
export function resolveBattle(attacker: GameCard, defender: GameCard | null): BattleResult {
  const result: BattleResult = {
    attacker,
    defender,
    attackerDamage: 0,
    defenderDamage: 0,
    isPlayerAttack: defender === null,
    defenderLifeLost: 0,
    creaturiesDestroyed: [],
    winner: null,
  }

  if (defender === null) {
    // 直接ダメージ
    result.defenderLifeLost = attacker.power
    result.winner = "attacker"
    return result
  }

  // クリーチャー同士のバトル
  const attackerTakesDamage = defender.power
  const defenderTakesDamage = attacker.power

  result.attackerDamage = attackerTakesDamage
  result.defenderDamage = defenderTakesDamage

  // ダメージ結果を判定
  const attackerDestroyed = attackerTakesDamage >= attacker.power
  const defenderDestroyed = defenderTakesDamage >= defender.power

  if (attackerDestroyed && defenderDestroyed) {
    result.winner = "both-destroyed"
    result.creaturiesDestroyed = [attacker, defender]
  } else if (attackerDestroyed) {
    result.winner = "defender"
    result.creaturiesDestroyed = [attacker]
  } else if (defenderDestroyed) {
    result.winner = "attacker"
    result.creaturiesDestroyed = [defender]
  } else {
    result.winner = null
    // どちらもダメージを記録するが生存
  }

  return result
}

/**
 * 全てのバトルを解決
 */
export function resolveAllBattles(
  battleState: BattlePhaseState,
  allCards: GameCard[],
): {
  updatedBattleState: BattlePhaseState
  results: BattleResult[]
  totalPlayerDamage: number
} {
  const results: BattleResult[] = []
  let totalPlayerDamage = 0

  for (const attack of battleState.pendingBattles) {
    const attacker = allCards.find((c) => c.instanceId === attack.attackerId)
    if (!attacker) continue

    let defender: GameCard | null = null
    if (attack.defenderId) {
      defender = allCards.find((c) => c.instanceId === attack.defenderId)
    }

    const result = resolveBattle(attacker, defender)
    results.push(result)

    if (result.isPlayerAttack) {
      totalPlayerDamage += result.defenderLifeLost
    }
  }

  return {
    updatedBattleState: {
      ...battleState,
      resolvedBattles: [...battleState.resolvedBattles, ...results],
      pendingBattles: [],
    },
    results,
    totalPlayerDamage,
  }
}

/**
 * 攻撃宣言をリセット
 */
export function resetBattlePhase(): BattlePhaseState {
  return initializeBattlePhase()
}

/**
 * バトル結果サマリーを生成
 */
export function generateBattleSummary(result: BattleResult): string {
  let summary = `【バトル結果】${result.attacker.name}`

  if (result.isPlayerAttack) {
    summary += `\nプレイヤーに${result.defenderLifeLost}ダメージ`
  } else if (result.defender) {
    summary += ` vs ${result.defender.name}\n`
    summary += `攻撃側ダメージ: ${result.attackerDamage}\n`
    summary += `防御側ダメージ: ${result.defenderDamage}\n`

    switch (result.winner) {
      case "attacker":
        summary += `結果: ${result.defender.name}が破壊`
        break
      case "defender":
        summary += `結果: ${result.attacker.name}が破壊`
        break
      case "both-destroyed":
        summary += "結果: 両方破壊"
        break
      default:
        summary += "結果: 継続"
    }
  }

  return summary
}

/**
 * バトルフェーズの最終処理（破壊されたクリーチャーを墓地に）
 */
export function applyBattleResults(allCards: GameCard[], results: BattleResult[]): GameCard[] {
  let updatedCards = [...allCards]

  for (const result of results) {
    for (const destroyedCard of result.creaturiesDestroyed) {
      updatedCards = updatedCards.map((card) => {
        if (card.instanceId === destroyedCard.instanceId) {
          return {
            ...card,
            zone: "in-graveyard" as any,
            isTapped: false,
            isAttacking: false,
            damageOnCard: 0,
          }
        }
        return card
      })
    }

    // 生存したクリーチャーのダメージを適用
    if (result.winner !== "both-destroyed" && result.winner !== null) {
      if (result.winner === "defender" && result.defender) {
        updatedCards = updatedCards.map((card) => {
          if (card.instanceId === result.defender!.instanceId) {
            return {
              ...card,
              damageOnCard: card.damageOnCard + result.attackerDamage,
            }
          }
          return card
        })
      }
    }
  }

  return updatedCards
}
