import { PurpleDie } from "../dice";
import { SpecialtyPlayer } from "./SpecialtyPlayer";

export default class PurplePepper extends SpecialtyPlayer {
  constructor() {
    super("Purple Pepper", PurpleDie);
  }
}
