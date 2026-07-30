import Die from "../core/Die";

export default class PurpleDie extends Die {
  static color = "purple";

  constructor(faces: number) {
    super(faces);
  }
}
