import Die from "../core/Die";
import Player from "../core/Player";

/**
 * Represents the human-controlled player in an interactive game.
 *
 * Die picks for a `HumanPlayer` are driven by {@link Game.userPickDie} rather
 * than the automatic {@link chooseDie} path. Calling `chooseDie` directly
 * throws to make the incorrect code path immediately visible during development.
 */
export default class HumanPlayer extends Player {
  constructor() {
    super("Human");
    this.isHuman = true;
  }

  /**
   * Not supported for human players — picks are made via `Game.userPickDie`.
   *
   * @throws {Error} Always.
   */
  public chooseDie(_dice: Die[]): Die[] | undefined {
    throw new Error('Human picks are driven by Game.userPickDie, not chooseDie');
  }
}
