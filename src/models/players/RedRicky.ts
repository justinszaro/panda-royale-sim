import Die from "../core/Die";
import { ClearDie, RedDie } from "../dice";
import Player from "../core/Player";

export default class RedRicky extends Player {
  constructor() {
    super("Red Ricky");
  }

  public chooseDie(dice: Die[]) {
    const yellowResult = this.tryPickYellow(dice);
    if (yellowResult !== undefined) return yellowResult;

    const redIndex = dice.findIndex((die) => die instanceof RedDie);
    if (redIndex !== -1) {
      this.dice.push(dice[redIndex]!);
      dice.splice(redIndex, 1);
      return dice;
    }

    return super.chooseDie(dice);
  }

  public tradeDie(players: Player[]) {
    const anyOpponentHasRed = players.some((p) =>
      p.dice.some((die) => die instanceof RedDie),
    );
    if (!anyOpponentHasRed) {
      return super.tradeDie(players);
    }

    const whiteDice = this.dice.filter(
      (die): die is ClearDie =>
        die instanceof ClearDie && !(die as ClearDie).isTradable,
    );
    if (whiteDice.length === 0) {
      return null;
    }

    for (const whiteDie of whiteDice) {
      whiteDie.isTradable = false;

      if (players.length === 0) continue;

      const opponentsWithRed = players.filter((p) =>
        p.dice.some((die) => die instanceof RedDie),
      );
      const randomOpponent = opponentsWithRed[Math.floor(Math.random() * opponentsWithRed.length)];
      if (!randomOpponent) continue;

      const redDice = randomOpponent.dice.filter((die) => die instanceof RedDie);
      if (redDice.length === 0) continue;

      const dieToTrade = redDice[Math.floor(Math.random() * redDice.length)];
      if (!dieToTrade) continue;

      this.dice = this.dice.filter((die) => die !== whiteDie);
      randomOpponent.dice = randomOpponent.dice.filter((die) => die !== dieToTrade);

      this.dice.push(dieToTrade);
      randomOpponent.dice.push(whiteDie);
    }
  }
}
