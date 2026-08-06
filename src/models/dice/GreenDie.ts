import Die from "../core/Die";

/**
 * A green die. Only one green die may be scored per round; its face value is
 * recorded directly with no multiplier.
 */
export default class GreenDie extends Die {
  static color = "green";

  /** @param faces - Number of faces on the die. */
  constructor(faces: number) {
    super(faces);
  }
}
