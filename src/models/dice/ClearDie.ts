import Die from '../core/Die';

/**
 * A clear (white) die used for the trading mechanic.
 *
 * When a player holds an untradable clear die at the end of a round they may
 * swap it for another player's die during the trading phase. The `isTradable`
 * flag starts as `false` after being picked from the draft pool and is flipped
 * to `true` once the die has been offered in a trade, preventing it from being
 * traded again in the same round.
 */
export default class ClearDie extends Die {
  /** `false` until this die has been used in a trade; `true` afterwards. */
  public isTradable: boolean;

  /**
   * @param faces - Number of faces on the die.
   * @param isTradable - Initial tradable state. Pass `true` only when
   *   re-creating a die that has already been traded.
   */
  constructor(faces: number, isTradable: boolean = false) {
    super(faces);
    this.isTradable = isTradable;
  }
}
