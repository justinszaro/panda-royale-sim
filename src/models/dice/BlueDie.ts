import Die from '../core/Die';

export default class BlueDie extends Die {
  isGlittery: boolean;

  constructor(faces: number, isGlittery: boolean = false) {
    super(faces);
    this.isGlittery = isGlittery;
  }
}
