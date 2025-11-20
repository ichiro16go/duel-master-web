export const GAME_CONSTANTS = {
  // シールドが敗北条件になる

  // シールド関連
  INITIAL_SHIELDS: 0,
  MAX_SHIELDS: 4,

  // マナ関連
  INITIAL_MANA: 0,
  MAX_MANA_PER_TURN: 13,
  MANA_INCREMENT_PER_TURN: 1,

  // デッキ関連
  INITIAL_HAND_SIZE: 3,
  DECK_SIZE: 40,

  // ゲーム終了条件（シールド5個破壊で敗北）
  DEFEAT_SHIELD_DESTROYED: 5,

  // ターンフェーズ定義
  TURN_PHASE: {
    START: "start",
    DRAW: "draw",
    MAIN: "main",
    ATTACK: "attack",
    END: "end",
  } as const,
}
