import Die from "../core/Die";

export default class PinkDie extends Die {
  static color = "pink";

  constructor(faces: number) {
    super(faces);
  }
}
