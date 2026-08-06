import Die from "./Die";
import { generateId } from "./utils";
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
  isHuman: boolean = false;

  constructor(name: string) {
    this.id = generateId();
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

  public rollDice(): void {
    this.dice.forEach((die) => die.roll());
  }

  public computeYellowTiebreaker(): number {
    const yellowDice = this.dice.filter((die) => die instanceof YellowDie);
    return yellowDice.reduce(
      (sum, die) => sum + Math.floor(Math.random() * die.sides) + 1,
      0,
    );
  }

  public chooseDie(dice: Die[]): Die[] | undefined {
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

  public tradeDie(players: Player[]): Array<{ gave: Die; got: Die; opponent: Player }> {
    const trades: Array<{ gave: Die; got: Die; opponent: Player }> = [];
    const whiteDice = this.dice.filter(
      (die): die is ClearDie =>
        die instanceof ClearDie && !(die as ClearDie).isTradable,
    );
    if (whiteDice.length === 0) return trades;

    for (const whiteDie of whiteDice) {
      whiteDie.isTradable = false;

      if (players.length === 0) continue;
      const randomOpponent = players[Math.floor(Math.random() * players.length)];
      if (!randomOpponent) continue;
      const tradableDice = randomOpponent.dice.filter(
        (die) => !(die instanceof ClearDie),
      );
      if (tradableDice.length === 0) continue;

      const dieToTrade = tradableDice[Math.floor(Math.random() * tradableDice.length)];
      if (!dieToTrade) continue;

      this.dice = this.dice.filter((die) => die !== whiteDie);
      randomOpponent.dice = randomOpponent.dice.filter((die) => die !== dieToTrade);

      this.dice.push(dieToTrade);
      randomOpponent.dice.push(whiteDie);

      trades.push({ gave: whiteDie, got: dieToTrade, opponent: randomOpponent });
    }

    return trades;
  }

  public sumScore(): number {
    this.roundScore =
      this.sumYellowDice() +
      this.sumPurpleDice() +
      this.sumBlueDice() +
      this.sumRedDice() +
      this.sumGreenDice() +
      this.sumClearDice() +
      this.sumPinkDice();
    this.getCurrentRoundScore().total = this.roundScore;

    return this.roundScore;
  }

  public sumYellowDice(): number {
    return this.sumDiceByType(YellowDie, "yellow");
  }

  public sumPurpleDice(): number {
    return this.sumDiceByType(PurpleDie, "purple", (dice) =>
      dice.reduce((s, d) => s + (d.value ?? 0), 0) * 2,
    );
  }

  public sumBlueDice(): number {
    return this.sumDiceByType(BlueDie, "blue", (dice) => {
      const sum = dice.reduce((s, d) => s + (d.value ?? 0), 0);
      return dice.some((d) => d.isGlittery) ? sum * 2 : sum;
    });
  }

  public sumRedDice(): number {
    return this.sumDiceByType(RedDie, "red", (dice) =>
      dice.reduce((s, d) => s + (d.value ?? 0), 0) * dice.length,
    );
  }

  public sumGreenDice(): number {
    const greenDie = this.dice.find((die) => die instanceof GreenDie);
    return this.recordScore("green", greenDie?.value ?? 0);
  }

  public sumClearDice(): number {
    return this.sumDiceByType(ClearDie, "clear");
  }

  public sumPinkDice(): number {
    const pinkDie = this.dice.find((die) => die instanceof PinkDie);
    return this.recordScore("pink", pinkDie?.value ?? 0);
  }

  private sumDiceByType<T extends Die>(
    DieClass: new (...args: any[]) => T,
    color: Exclude<keyof RoundScore, "total">,
    compute?: (dice: T[]) => number,
  ): number {
    const dice = this.dice.filter((d): d is T => d instanceof DieClass);
    const sum = compute ? compute(dice) : dice.reduce((s, d) => s + (d.value ?? 0), 0);
    return this.recordScore(color, sum);
  }

  get totalScore(): number {
    return this.scores.reduce((sum, s) => sum + s.total, 0);
  }

  get roundScoreTotals(): number[] {
    return this.scores.map((s) => s.total);
  }

  public toString(): string {
    return `${this.name} - Dice: [${this.dice.map((die) => die.toString()).join(", ")}] - Scores: ${JSON.stringify(this.scores)}`;
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
