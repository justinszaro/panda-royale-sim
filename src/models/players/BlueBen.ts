import Die from "../core/Die";
import { BlueDie, ClearDie } from "../dice";
import Player from "../core/Player";

export default class BlueBen extends Player {
  constructor() {
    super("Blue Ben");
  }

  public chooseDie(dice: Die[]) {
    const yellowResult = this.tryPickYellow(dice);
    if (yellowResult !== undefined) return yellowResult;

    const blueIndex = dice.findIndex((die) => die instanceof BlueDie);
    if (blueIndex !== -1) {
      this.dice.push(dice[blueIndex]!);
      dice.splice(blueIndex, 1);
      return dice;
    }

    return super.chooseDie(dice);
  }

  public tradeDie(players: Player[]) {
    const anyOpponentHasBlue = players.some((p) =>
      p.dice.some((die) => die instanceof BlueDie),
    );
    if (!anyOpponentHasBlue) {
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

      const opponentsWithBlue = players.filter((p) =>
        p.dice.some((die) => die instanceof BlueDie),
      );
      const randomOpponent = opponentsWithBlue[Math.floor(Math.random() * opponentsWithBlue.length)];
      if (!randomOpponent) continue;

      const blueDice = randomOpponent.dice.filter((die) => die instanceof BlueDie);
      if (blueDice.length === 0) continue;

      const dieToTrade = blueDice[Math.floor(Math.random() * blueDice.length)];
      if (!dieToTrade) continue;

      this.dice = this.dice.filter((die) => die !== whiteDie);
      randomOpponent.dice = randomOpponent.dice.filter((die) => die !== dieToTrade);

      this.dice.push(dieToTrade);
      randomOpponent.dice.push(whiteDie);
    }
  }
}
