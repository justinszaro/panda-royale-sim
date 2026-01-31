export default class Die {
  sides: number;
  value: number | null;

  constructor(public sides: number) {
    this.sides = sides;
    this.value = null;
  }

  roll(): number {
    this.value = Math.floor(Math.random() * this.sides) + 1;
    return this.value;
  }
}
