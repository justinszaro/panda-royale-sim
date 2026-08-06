import Die from "../core/Die";
import { ClearDie } from "../dice";
import Player from "../core/Player";

export abstract class SpecialtyPlayer extends Player {
  protected readonly favoriteDieClass: new (...args: any[]) => Die;

  constructor(name: string, favoriteDieClass: new (...args: any[]) => Die) {
    super(name);
    this.favoriteDieClass = favoriteDieClass;
  }

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
