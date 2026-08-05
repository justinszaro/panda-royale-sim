import Die from "../core/Die";
import { ClearDie, PurpleDie } from "../dice";
import Player from "../core/Player";

export default class PurplePepper extends Player {
  constructor() {
    super("Purple Pepper");
  }

  public chooseDie(dice: Die[]) {
    const yellowResult = this.tryPickYellow(dice);
    if (yellowResult !== undefined) return yellowResult;

    const purpleIndex = dice.findIndex((die) => die instanceof PurpleDie);
    if (purpleIndex !== -1) {
      this.dice.push(dice[purpleIndex]!);
      dice.splice(purpleIndex, 1);
      return dice;
    }

    return super.chooseDie(dice);
  }

  public tradeDie(players: Player[]) {
    const anyOpponentHasPurple = players.some((p) =>
      p.dice.some((die) => die instanceof PurpleDie),
    );
    if (!anyOpponentHasPurple) {
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

      const opponentsWithPurple = players.filter((p) =>
        p.dice.some((die) => die instanceof PurpleDie),
      );
      const randomOponent = opponentsWithPurple[Math.floor(Math.random() * opponentsWithPurple.length)];
      if (!randomOponent) continue;

      const purpleDice = randomOponent.dice.filter((die) => die instanceof PurpleDie);
      if (purpleDice.length === 0) continue;

      const dieToTrade = purpleDice[Math.floor(Math.random() * purpleDice.length)];
      if (!dieToTrade) continue;

      this.dice = this.dice.filter((die) => die !== whiteDie);
      randomOponent.dice = randomOponent.dice.filter(
        (die) => die !== dieToTrade,
      );

      this.dice.push(dieToTrade);
      randomOponent.dice.push(whiteDie);
    }
  }
}
