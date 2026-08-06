import Player from "../core/Player";

/**
 * AI player that picks and trades dice at random with no colour preference.
 *
 * Random Ricky uses the default {@link Player} strategy throughout the game,
 * serving as a baseline opponent in simulations.
 */
export default class RandomRicky extends Player {
  constructor() {
    super("Random Ricky");
  }
}
