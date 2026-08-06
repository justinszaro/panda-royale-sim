import Die from "../core/Die";

/**
 * A pink "pity" die awarded to low-scoring players at the end of each round.
 *
 * Pink dice are collected from all players' hands after scoring, pooled, and
 * redistributed by the {@link Game} to the players who ranked lowest that
 * round. The die's face value is added directly to the player's score with no
 * multiplier.
 */
export default class PinkDie extends Die {
  static color = "pink";

  /** @param faces - Number of faces on the die. */
  constructor(faces: number) {
    super(faces);
  }
}
