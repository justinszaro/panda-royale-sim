import Die from "./Die";
import {
  BlueDie,
  ClearDie,
  GreenDie,
  PinkDie,
  PurpleDie,
  RedDie,
  YellowDie,
} from "../dice";

export interface RoundScore {
  yellow: number;
  purple: number;
  blue: number;
  red: number;
  green: number;
  clear: number;
  pink: number;
  total: number;
}

export default class Player {
  readonly id: string;
  name: string;
  dice: Die[];
  scores: RoundScore[] = [];
  roundScore: number;
  private currentRoundScore?: RoundScore;
  hasPandaToken: boolean;
  shouldSeekYellow: boolean;

  constructor(name: string) {
    this.id = Player.generateId();
    this.name = name;
    this.hasPandaToken = false;
    this.shouldSeekYellow = false;

    this.dice = [new YellowDie(6)];
    this.roundScore = 0;
  }

  public beginRound(): void {
    const roundScore: RoundScore = {
      yellow: 0,
      purple: 0,
      blue: 0,
      red: 0,
      green: 0,
      clear: 0,
      pink: 0,
      total: 0,
    };

    this.scores.push(roundScore);
    this.currentRoundScore = roundScore;
  }

  public rollDice() {
    this.dice.forEach((die) => die.roll());
  }

  public reRollYellowDice() {
    const yellowDice = this.dice.filter((die) => die instanceof YellowDie);
    return yellowDice.reduce(
      (sum, die) => sum + Math.floor(Math.random() * die.sides) + 1,
      0,
    );
  }

  public chooseDie(dice: Die[]) {
    if (dice.length === 0) return;
    const yellowResult = this.tryPickYellow(dice);
    if (yellowResult !== undefined) return yellowResult;

    const randomChoice = Math.floor(Math.random() * dice.length);
    const chosenDie = dice[randomChoice];
    if (chosenDie) {
      this.dice.push(chosenDie);
    }

    dice.splice(randomChoice, 1);
    return dice;
  }

  protected tryPickYellow(dice: Die[]): Die[] | undefined {
    if (!this.shouldSeekYellow) return undefined;
    const yellowIndex = dice.findIndex((die) => die instanceof YellowDie);
    if (yellowIndex === -1) return undefined;
    this.dice.push(dice[yellowIndex]!);
    dice.splice(yellowIndex, 1);
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

  public sumScore(): number {
    const roundScore = this.getCurrentRoundScore();
    this.roundScore =
      this.sumYellowDice() +
      this.sumPurpleDice() +
      this.sumBlueDice() +
      this.sumRedDice() +
      this.sumGreenDice() +
      this.sumClearDice() +
      this.sumPinkDice();
    roundScore.total = this.roundScore;

    return this.roundScore;
  }

  public sumYellowDice(): number {
    const yellowDice = this.dice.filter((die) => die instanceof YellowDie);
    const sum = yellowDice.reduce((sum, die) => sum + (die?.value || 0), 0);

    return this.recordScore("yellow", sum);
  }

  public sumPurpleDice(): number {
    const purpleDice = this.dice.filter((die) => die instanceof PurpleDie);
    const sum = purpleDice.reduce((sum, die) => sum + (die?.value || 0), 0) * 2;

    return this.recordScore("purple", sum);
  }

  public sumBlueDice(): number {
    const blueDice = this.dice.filter((die) => die instanceof BlueDie);
    const hasGlitterDice = blueDice.some((die) => (die as BlueDie).isGlittery);

    let sum = blueDice.reduce((sum, die) => sum + (die?.value || 0), 0);
    if (hasGlitterDice) {
      sum *= 2;
    }

    return this.recordScore("blue", sum);
  }

  public sumRedDice(): number {
    const redDice = this.dice.filter((die) => die instanceof RedDie);
    let sum = redDice.reduce((sum, die) => sum + (die?.value || 0), 0);

    sum *= redDice.length;

    return this.recordScore("red", sum);
  }

  public sumGreenDice(): number {
    const greenDie = this.dice.find(
      (die) => die instanceof GreenDie,
    ) as GreenDie;
    if (!greenDie) {
      return this.recordScore("green", 0);
    }

    return this.recordScore("green", greenDie.value ?? 0);
  }

  public sumClearDice(): number {
    const clearDice = this.dice.filter((die) => die instanceof ClearDie);
    const sum = clearDice.reduce((sum, die) => sum + (die?.value || 0), 0);

    return this.recordScore("clear", sum);
  }

  public sumPinkDice(): number {
    const pinkDie = this.dice.find((die) => die instanceof PinkDie) as PinkDie;

    return this.recordScore("pink", pinkDie?.value ?? 0);
  }

  public toString(): string {
    return `${this.name} - Dice: [${this.dice.map((die) => die.toString()).join(", ")}] - Scores: ${JSON.stringify(this.scores)}`;
  }

  private static generateId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  }

  private getCurrentRoundScore(): RoundScore {
    if (!this.currentRoundScore) {
      this.beginRound();
    }

    const currentRoundScore = this.currentRoundScore;
    if (!currentRoundScore) {
      throw new Error("Unable to initialize the current round score");
    }

    return currentRoundScore;
  }

  private recordScore(
    color: Exclude<keyof RoundScore, "total">,
    score: number,
  ): number {
    this.getCurrentRoundScore()[color] = score;
    return score;
  }
}
