import Die from '../core/Die';

export default class ClearDie implements Dice {
  sides: number;
  value: number | null;
  isTradable: boolean;

  constructor(sides: number, isTradable: boolean) {
    this.sides = sides;
    this.value = null;
    this.isTradable = false; // Must be rolled first.
  }
}
