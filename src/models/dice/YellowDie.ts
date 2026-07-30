import Die from "../core/Die";

export default class YellowDie extends Die {
  static color = "yellow";

  constructor(faces: number) {
    super(faces);
  }
}
