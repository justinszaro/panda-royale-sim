import Plater from "../core/Player";

export default class RandomRicky extends Player {
  constructor() {
    super("Random Ricky");
  }

  public chooseDie(dice: Die[]) {
    if (dice.length === 0) return;
    const randomChoice = Math.floor(Math.random() * dice.length);
    const chosenDie = dice[randomChoice];
    if (chosenDie) {
      this.dice.push(chosenDie);
    }

    dice.splice(randomChoice, 1);
    return dice;
  }

  public tradeDie(players: Player[]) {
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
      const randomOponent = players[Math.floor(Math.random() * players.length)];
      if (!randomOponent) continue;
      const tradableDice = randomOponent.dice.filter(
        (die) => !(die instanceof ClearDie),
      );
      if (tradableDice.length === 0) continue;

      const randomDieIndex = Math.floor(Math.random() * tradableDice.length);
      const dieToTrade = tradableDice[randomDieIndex];
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
