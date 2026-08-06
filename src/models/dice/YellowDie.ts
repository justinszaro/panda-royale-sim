import Die from "../core/Die";

/**
 * A yellow die. Yellow dice determine draft order each round: the player whose
 * yellow dice sum highest picks first and earns the panda token. Yellow dice
 * are also used to break ties via {@link Player.computeYellowTiebreaker}.
 *
 * Every player starts with one yellow d6 in their hand.
 */
export default class YellowDie extends Die {
  static color = "yellow";

  /** @param faces - Number of faces on the die. */
  constructor(faces: number) {
    super(faces);
  }
}
