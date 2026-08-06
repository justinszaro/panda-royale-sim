import Die from "../core/Die";

/**
 * A blue die. Blue dice score their face value sum, doubled when at least one
 * blue die in the player's hand has {@link isGlittery} set to `true`.
 */
export default class BlueDie extends Die {
  static color = "blue";

  /** Whether this particular die has a glittery finish. */
  isGlittery: boolean;

  /**
   * @param faces - Number of faces on the die.
   * @param isGlittery - `true` if this is a glittery variant that triggers the
   *   ×2 bonus for all blue dice.
   */
  constructor(faces: number, isGlittery: boolean = false) {
    super(faces);
    this.isGlittery = isGlittery;
  }
}
