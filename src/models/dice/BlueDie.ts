import Die from '../core/Die';

export default class BlueDie implements Die {
  sides: number;
  value: number | null;
  isGlittery: boolean;

  constructor(sides: number, isGlittery: boolean) {
    this.sides = sides;
    this.value = null;
    this.isGlittery = isGlittery;
  }
}
