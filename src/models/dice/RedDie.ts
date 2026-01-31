import Die from '../core/Die';

export default class RedDie implements Dice {
  sides: number;
  value: number | null;

  constructor(sides: number) {
    this.sides = sides;
    this.value = null;
  }

  roll(): number {
    this.value = Math.floor(Math.random() * this.sides) + 1;
    if (this.value <= this.sides / 2) {
      this.value = -this.value;
    }

    return this.value;
  }
}
