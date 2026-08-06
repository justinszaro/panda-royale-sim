import Die from "../core/Die";
import { ClearDie } from "../dice";
import Player from "../core/Player";

/**
 * Abstract base for AI players that have a preferred die colour.
 *
 * `SpecialtyPlayer` overrides {@link chooseDie} to always pick a die of the
 * {@link favoriteDieClass} type when one is available, and overrides
 * {@link tradeDie} to target opponents who hold that die type.
 *
 * Concrete subclasses (e.g. {@link BlueBen}, {@link RedRyder}) simply call
 * `super(name, DieClass)` to wire up the preference.
 */
export abstract class SpecialtyPlayer extends Player {
  /** The die class this player prioritises when drafting and trading. */
  protected readonly favoriteDieClass: new (...args: any[]) => Die;

  /**
   * @param name - Display name for the player.
   * @param favoriteDieClass - Constructor of the preferred die type.
   */
  constructor(name: string, favoriteDieClass: new (...args: any[]) => Die) {
    super(name);
    this.favoriteDieClass = favoriteDieClass;
  }

  /**
   * Picks a die of {@link favoriteDieClass} when available; falls back to
   * {@link Player.chooseDie} (random selection) otherwise. Yellow-die
   * preference via {@link tryPickYellow} is always checked first.
   *
   * @param dice - The current draft pool (mutated in place).
   * @returns The remaining draft pool after the pick, or `undefined` when empty.
   */
  public chooseDie(dice: Die[]): Die[] | undefined {
    const yellowResult = this.tryPickYellow(dice);
    if (yellowResult !== undefined) return yellowResult;

    const favoriteIndex = dice.findIndex((die) => die instanceof this.favoriteDieClass);
    if (favoriteIndex !== -1) {
      this.dice.push(dice[favoriteIndex]!);
      dice.splice(favoriteIndex, 1);
      return dice;
    }

    return super.chooseDie(dice);
  }

  /**
   * Trades clear dice for the player's favourite die type when any opponent
   * holds one. Falls back to the default (random) trade when no opponent has
   * the preferred die.
   *
   * @param players - All opponents (excluding this player).
   * @returns An array describing each trade that occurred.
   */
  public override tradeDie(players: Player[]): Array<{ gave: Die; got: Die; opponent: Player }> {
    const anyOpponentHasFavorite = players.some((p) =>
      p.dice.some((die) => die instanceof this.favoriteDieClass),
    );
    if (!anyOpponentHasFavorite) {
      return super.tradeDie(players);
    }

    const trades: Array<{ gave: Die; got: Die; opponent: Player }> = [];
    const whiteDice = this.dice.filter(
      (die): die is ClearDie =>
        die instanceof ClearDie && !(die as ClearDie).isTradable,
    );
    if (whiteDice.length === 0) return trades;

    for (const whiteDie of whiteDice) {
      whiteDie.isTradable = false;

      if (players.length === 0) continue;

      const opponentsWithFavorite = players.filter((p) =>
        p.dice.some((die) => die instanceof this.favoriteDieClass),
      );
      const randomOpponent = opponentsWithFavorite[Math.floor(Math.random() * opponentsWithFavorite.length)];
      if (!randomOpponent) continue;

      const favoriteDice = randomOpponent.dice.filter((die) => die instanceof this.favoriteDieClass);
      if (favoriteDice.length === 0) continue;

      const dieToTrade = favoriteDice[Math.floor(Math.random() * favoriteDice.length)];
      if (!dieToTrade) continue;

      this.dice = this.dice.filter((die) => die !== whiteDie);
      randomOpponent.dice = randomOpponent.dice.filter((die) => die !== dieToTrade);

      this.dice.push(dieToTrade);
      randomOpponent.dice.push(whiteDie);

      trades.push({ gave: whiteDie, got: dieToTrade, opponent: randomOpponent });
    }

    return trades;
  }
}
