import { RedDie } from "../dice";
import { SpecialtyPlayer } from "./SpecialtyPlayer";

export default class RedRyder extends SpecialtyPlayer {
  constructor() {
    super("Red Ryder", RedDie);
  }
}
