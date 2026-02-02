export default class Die {
  sides: number;
  value: number | null;

  constructor(faces: number) {
    this.sides = faces;
    this.value = null;
  }

  public roll(): number {
    this.value = Math.floor(Math.random() * this.sides) + 1;
    return this.value;
  }
}
