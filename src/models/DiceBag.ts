import Die from './core/Die';
import {
  BlueDie,
  ClearDie,
  GreenDie,
  PinkDie,
  PurpleDie,
  RedDie,
  YellowDie,
} from './dice';

/**
 * Full composition of the shared dice pool used in a standard game.
 * Each entry specifies how many dice of a given configuration to add.
 */
const DIE_CONFIGS: Array<{ count: number; create: () => Die }> = [
  { count: 7,  create: () => new YellowDie(8) },

  { count: 10, create: () => new GreenDie(20) },

  { count: 10, create: () => new BlueDie(6, false) },
  { count: 9,  create: () => new BlueDie(8, false) },
  { count: 9,  create: () => new BlueDie(12, false) },
  { count: 7,  create: () => new BlueDie(6, true) },

  { count: 7,  create: () => new PurpleDie(8) },
  { count: 7,  create: () => new PurpleDie(12) },

  { count: 10, create: () => new RedDie(6) },
  { count: 9,  create: () => new RedDie(8) },

  { count: 7,  create: () => new ClearDie(6, false) },
];

/**
 * The shared bag of dice from which players draft each round.
 *
 * On construction the bag is filled according to {@link DIE_CONFIGS}. The
 * {@link Game} draws from the bag at the start of each draft phase and returns
 * any unchosen dice at the end via {@link returnDice}.
 */
export default class DiceBag {
  /** All dice currently in the bag. */
  public dice: Die[] = [];

  constructor() {
    for (const { count, create } of DIE_CONFIGS) {
      for (let i = 0; i < count; i++) {
        this.dice.push(create());
      }
    }
  }

  /**
   * Randomly draws up to `numDice` dice from the bag without replacement.
   *
   * @param numDice - Maximum number of dice to draw.
   * @returns The drawn dice (may be fewer than `numDice` if the bag runs low).
   */
  public drawRandomDice(numDice: number): Die[] {
    const drawnDice: Die[] = [];
    for (let i = 0; i < numDice; i++) {
      if (this.dice.length === 0) break;
      const randomIndex = Math.floor(Math.random() * this.dice.length);
      const [drawnDie] = this.dice.splice(randomIndex, 1);
      if (drawnDie) {
        drawnDice.push(drawnDie);
      }
    }

    return drawnDice;
  }

  /**
   * Returns dice to the bag, making them available for future draws.
   *
   * @param diceToReturn - Dice to add back into the bag.
   */
  public returnDice(diceToReturn: Die[]): void {
    this.dice.push(...diceToReturn);
  }
}
