import Die from "../core/Die";
import { ClearDie, GreenDie } from "../dice";
import Player from "../core/Player";

export default class GreenGatsby extends Player {
  constructor() {
    super("Green Gatsby");
  }

  public chooseDie(dice: Die[]) {
    const yellowResult = this.tryPickYellow(dice);
    if (yellowResult !== undefined) return yellowResult;

    const greenIndex = dice.findIndex((die) => die instanceof GreenDie);
    if (greenIndex !== -1) {
      this.dice.push(dice[greenIndex]!);
      dice.splice(greenIndex, 1);
      return dice;
    }

    return super.chooseDie(dice);
  }

  public tradeDie(players: Player[]) {
    const anyOpponentHasGreen = players.some((p) =>
      p.dice.some((die) => die instanceof GreenDie),
    );
    if (!anyOpponentHasGreen) {
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

      const opponentsWithGreen = players.filter((p) =>
        p.dice.some((die) => die instanceof GreenDie),
      );
      const randomOpponent = opponentsWithGreen[Math.floor(Math.random() * opponentsWithGreen.length)];
      if (!randomOpponent) continue;

      const greenDice = randomOpponent.dice.filter((die) => die instanceof GreenDie);
      if (greenDice.length === 0) continue;

      const dieToTrade = greenDice[Math.floor(Math.random() * greenDice.length)];
      if (!dieToTrade) continue;

      this.dice = this.dice.filter((die) => die !== whiteDie);
      randomOpponent.dice = randomOpponent.dice.filter((die) => die !== dieToTrade);

      this.dice.push(dieToTrade);
      randomOpponent.dice.push(whiteDie);
    }
  }
}
