
import Die from './Die';
import {
  BlueDie,
  ClearDie,
  GreenDie,
  PinkDie,
  PurpleDie,
  RedDie,
  YellowDie,
} from '../dice';

export default class Player {
  name: string;
  dice: Die[];
  scores: number[] = [];
  roundScore: number;

  constructor(name: string) {
    this.name = name;

    this.dice = [
      new YellowDie(6),
    ]
    this.roundScore = 0;
    this.scores = [];
  }

  rollDice() {
    this.dice.forEach(die => die.roll());
  }

  reRollYellowDice() {
    const yellowDice = this.dice.filter(die => die instanceof YellowDie);
    yellowDice.forEach(die => die.roll());

    return this.sumYellowDice();
  }

  chooseDie(dice: Die[]) {
    if (dice.length === 0) return;
    const randomChoice = Math.floor(Math.random() * dice.length);
    const chosenDie = dice[randomChoice];
    if (chosenDie) {
      this.dice.push(chosenDie);
    }

    dice.splice(randomChoice, 1);
    return dice;
  }

  tradeDie(players: Player[]) {
    const whiteDice = this.dice.filter(
      (die): die is ClearDie => die instanceof ClearDie && !(die as ClearDie).isTradable
    );
    if (whiteDice.length === 0) {
      return null;
    }

    for (const whiteDie of whiteDice) {
      whiteDie.isTradable = false;

      if (players.length === 0) continue;
      const randomOponent = players[Math.floor(Math.random() * players.length)];
      if (!randomOponent) continue;
      const tradableDice = randomOponent.dice.filter(die => !(die instanceof ClearDie));
      if (tradableDice.length === 0) continue;

      const randomDieIndex = Math.floor(Math.random() * tradableDice.length);
      const dieToTrade = tradableDice[randomDieIndex];
      if (!dieToTrade) continue;

      this.dice = this.dice.filter(die => die !== whiteDie);
      randomOponent.dice = randomOponent.dice.filter(die => die !== dieToTrade);

      this.dice.push(dieToTrade);
      randomOponent.dice.push(whiteDie);
    }
  }

  sumScore(): number {
    this.roundScore =
      this.sumYellowDice() +
      this.sumPurpleDice() +
      this.sumBlueDice() +
      this.sumRedDice() +
      this.sumGreenDice() +
      this.sumClearDice() +
      this.sumPinkDice();
    this.scores.push(this.roundScore);

    return this.roundScore;
  }

  sumYellowDice(): number {
    const yellowDice = this.dice.filter(die => die instanceof YellowDie);
    return yellowDice.reduce((sum, die) => sum + (die?.value || 0), 0);
  }

  sumPurpleDice(): number {
    const purpleDice = this.dice.filter(die => die instanceof PurpleDie);
    return purpleDice.reduce((sum, die) => sum + (die?.value || 0), 0) * 2;
  }

  sumBlueDice(): number {
    const blueDice = this.dice.filter(die => die instanceof BlueDie);
    const hasGlitterDice = blueDice.some(die => (die as BlueDie).isGlittery);

    let sum = blueDice.reduce((sum, die) => sum + (die?.value || 0), 0);
    if (hasGlitterDice) {
      sum *= 2;
    }

    return sum;
  }

  sumRedDice(): number {
    const redDice = this.dice.filter(die => die instanceof RedDie);
    let sum = redDice.reduce((sum, die) => sum + (die?.value || 0), 0);

    return sum * redDice.length;
  }

  sumGreenDice(): number {
    const greenDie = this.dice.find(die => die instanceof GreenDie) as GreenDie;
    if (!greenDie) {
      return 0;
    }

    return greenDie?.value || 0;
  }

  sumClearDice(): number {
    const clearDice = this.dice.filter(die => die instanceof ClearDie);
    return clearDice.reduce((sum, die) => sum + (die?.value || 0), 0);
  }

  sumPinkDice(): number {
    const pinkDie = this.dice.find(die => die instanceof PinkDie) as PinkDie;

    return pinkDie?.value || 0;
  }
}
