import Die from "../core/Die";

/**
 * A red die with a high-risk / high-reward scoring mechanic.
 *
 * On a roll of 1–(sides/2) the die produces a **negative** value equal to the
 * roll result. Only rolls above the midpoint yield a positive score. All red
 * dice contribute to a single pool whose total is then multiplied by the
 * number of red dice held (see {@link Player.sumRedDice}).
 */
export default class RedDie extends Die {
  static color = "red";

  /** @param faces - Number of faces on the die. */
  constructor(faces: number) {
    super(faces);
  }

  /**
   * Rolls the die and negates the result when it falls in the lower half of
   * the range.
   *
   * @returns A positive value in `(sides/2, sides]` or a negative value in
   *   `[−(sides/2), −1]`.
   */
  public override roll(): number {
    this.value = Math.floor(Math.random() * this.sides) + 1;
    if (this.value <= this.sides / 2) {
      this.value = -this.value;
    }
    return this.value;
  }
}
