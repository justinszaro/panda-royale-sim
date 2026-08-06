import { BlueDie } from "../dice";
import { SpecialtyPlayer } from "./SpecialtyPlayer";

export default class BlueBen extends SpecialtyPlayer {
  constructor() {
    super("Blue Ben", BlueDie);
  }
}
