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

/**
 * Per-round breakdown of a player's score by die colour, plus the total.
 */
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

/**
 * Represents a player participating in a Panda Royale game.
 *
 * `Player` implements the default (random) AI strategy. Subclasses override
 * {@link chooseDie} and {@link tradeDie} to express more targeted strategies.
 * The {@link HumanPlayer} subclass is used when a human is in the game; its
 * picks are driven by `Game.userPickDie` instead of `chooseDie`.
 */
export default class Player {
  /** Stable, unique identifier for this player instance. */
  readonly id: string;

  /** Display name shown in logs and the UI. */
  name: string;

  /** All dice currently held by this player. */
  dice: Die[];

  /** History of round scores, one entry per completed round. */
  scores: RoundScore[] = [];

  /** Score achieved in the most recently completed round. */
  roundScore: number;

  private currentRoundScore?: RoundScore;

  /** Whether this player holds the panda token (drafts first next round). */
  hasPandaToken: boolean;

  /** When `true`, the player will always prefer picking a yellow die over others. */
  shouldSeekYellow: boolean;

  /** `true` for the human-controlled player; picks are made via `Game.userPickDie`. */
  isHuman: boolean = false;

  /**
   * @param name - Display name for the player.
   */
  constructor(name: string) {
    this.id = generateId();
    this.name = name;
    this.hasPandaToken = false;
    this.shouldSeekYellow = false;

    this.dice = [new YellowDie(6)];
    this.roundScore = 0;
  }

  /**
   * Initialises a fresh {@link RoundScore} for the current round and pushes it
   * onto {@link scores}. Must be called at the start of each round before
   * {@link rollDice} or {@link sumScore}.
   */
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

  /**
   * Rolls every die in the player's hand, updating each die's `value`.
   */
  public rollDice(): void {
    this.dice.forEach((die) => die.roll());
  }

  /**
   * Resolves yellow-die ties during draft ordering by rolling each yellow die
   * once more and summing the results.
   *
   * @returns The tiebreaker sum across all yellow dice.
   */
  public computeYellowTiebreaker(): number {
    const yellowDice = this.dice.filter((die) => die instanceof YellowDie);
    return yellowDice.reduce(
      (sum, die) => sum + Math.floor(Math.random() * die.sides) + 1,
      0,
    );
  }

  /**
   * Picks one die from `dice` and adds it to the player's hand.
   *
   * The default strategy is random selection, but subclasses may override this
   * method to express preferences. Returns the remaining dice after removal, or
   * `undefined` if the pool was empty.
   *
   * @param dice - The current draft pool (mutated in place).
   * @returns The remaining draft pool after the pick, or `undefined` when empty.
   */
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

  /**
   * Attempts to pick a yellow die from the pool when {@link shouldSeekYellow}
   * is `true`.
   *
   * @param dice - The current draft pool.
   * @returns The remaining pool after removing the yellow die, or `undefined`
   *   if the player does not seek yellow or no yellow die is present.
   */
  protected tryPickYellow(dice: Die[]): Die[] | undefined {
    if (!this.shouldSeekYellow) return undefined;
    const yellowIndex = dice.findIndex((die) => die instanceof YellowDie);
    if (yellowIndex === -1) return undefined;
    this.dice.push(dice[yellowIndex]!);
    dice.splice(yellowIndex, 1);
    return dice;
  }

  /**
   * Executes the clear-die trading phase for this player.
   *
   * Each untradable clear die in the player's hand is swapped for a random die
   * from a randomly selected opponent. The default strategy selects any
   * non-clear die at random.
   *
   * @param players - All opponents (excluding this player).
   * @returns An array describing each trade that occurred.
   */
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

  /**
   * Computes the player's total score for the current round across all die
   * colours and stores the breakdown in {@link scores}.
   *
   * @returns The total score for the current round.
   */
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

  /** Sums yellow dice face values and records the colour score. */
  public sumYellowDice(): number {
    return this.sumDiceByType(YellowDie, "yellow");
  }

  /**
   * Sums purple dice and applies the ×2 multiplier.
   * Purple dice are worth double their face value.
   */
  public sumPurpleDice(): number {
    return this.sumDiceByType(PurpleDie, "purple", (dice) =>
      dice.reduce((s, d) => s + (d.value ?? 0), 0) * 2,
    );
  }

  /**
   * Sums blue dice, doubling the total when at least one blue die is glittery.
   */
  public sumBlueDice(): number {
    return this.sumDiceByType(BlueDie, "blue", (dice) => {
      const sum = dice.reduce((s, d) => s + (d.value ?? 0), 0);
      return dice.some((d) => d.isGlittery) ? sum * 2 : sum;
    });
  }

  /**
   * Sums red dice and applies the multiplicative red bonus:
   * total = (sum of face values) × (number of red dice).
   */
  public sumRedDice(): number {
    return this.sumDiceByType(RedDie, "red", (dice) =>
      dice.reduce((s, d) => s + (d.value ?? 0), 0) * dice.length,
    );
  }

  /**
   * Records the value of the single green die (or 0 if none is held).
   * Only one green die can be scored per round.
   */
  public sumGreenDice(): number {
    const greenDie = this.dice.find((die) => die instanceof GreenDie);
    return this.recordScore("green", greenDie?.value ?? 0);
  }

  /** Sums clear dice face values and records the colour score. */
  public sumClearDice(): number {
    return this.sumDiceByType(ClearDie, "clear");
  }

  /**
   * Records the value of the single pink (pity) die (or 0 if none is held).
   * Only one pink die can be scored per round.
   */
  public sumPinkDice(): number {
    const pinkDie = this.dice.find((die) => die instanceof PinkDie);
    return this.recordScore("pink", pinkDie?.value ?? 0);
  }

  /**
   * Filters dice by type, applies an optional custom scoring function, and
   * records the result under the given colour key in the current round score.
   *
   * @param DieClass - Constructor of the die type to filter for.
   * @param color - Key in {@link RoundScore} to record the result under.
   * @param compute - Optional override for the score calculation; receives the
   *   filtered dice and returns a number. Defaults to summing face values.
   * @returns The computed score for the die type.
   */
  private sumDiceByType<T extends Die>(
    DieClass: new (...args: any[]) => T,
    color: Exclude<keyof RoundScore, "total">,
    compute?: (dice: T[]) => number,
  ): number {
    const dice = this.dice.filter((d): d is T => d instanceof DieClass);
    const sum = compute ? compute(dice) : dice.reduce((s, d) => s + (d.value ?? 0), 0);
    return this.recordScore(color, sum);
  }

  /** Cumulative score across all completed rounds. */
  get totalScore(): number {
    return this.scores.reduce((sum, s) => sum + s.total, 0);
  }

  /** Array of round totals in chronological order. */
  get roundScoreTotals(): number[] {
    return this.scores.map((s) => s.total);
  }

  /** Returns a human-readable summary of the player's dice and scores. */
  public toString(): string {
    return `${this.name} - Dice: [${this.dice.map((die) => die.toString()).join(", ")}] - Scores: ${JSON.stringify(this.scores)}`;
  }

  /**
   * Returns the active {@link RoundScore} object, initialising one if
   * {@link beginRound} has not yet been called for the current round.
   *
   * @throws {Error} If the round score cannot be initialised.
   */
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

  /**
   * Writes `score` into the named colour slot of the current round score and
   * returns it.
   *
   * @param color - Colour key to record under.
   * @param score - Value to store.
   * @returns The recorded score value.
   */
  private recordScore(
    color: Exclude<keyof RoundScore, "total">,
    score: number,
  ): number {
    this.getCurrentRoundScore()[color] = score;
    return score;
  }
}
