import Die from "../core/Die";

export default class GreenDie extends Die {
  static color = "green";

  constructor(faces: number) {
    super(faces);
  }
}
