
import Die from '../core/Die';

export default class ClearDie extends Die {
  public isTradable: boolean;

  constructor(faces: number, isTradable: boolean = false) {
    super(faces);
    this.isTradable = isTradable; // Must be rolled first.
  }
}
