import Die from "../core/Die";

/**
 * A purple die. Purple dice are worth double their face value: the sum of all
 * purple dice in a player's hand is multiplied by 2 during scoring.
 */
export default class PurpleDie extends Die {
  static color = "purple";

  /** @param faces - Number of faces on the die. */
  constructor(faces: number) {
    super(faces);
  }
}
