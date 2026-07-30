import Die from "../core/Die";

export default class RedDie extends Die {
  static color = "red";

  constructor(faces: number) {
    super(faces);
  }

  public override roll(): number {
    this.value = Math.floor(Math.random() * this.sides) + 1;
    if (this.value <= this.sides / 2) {
      this.value = -this.value;
    }
    return this.value;
  }
}
