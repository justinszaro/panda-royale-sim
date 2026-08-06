import { GreenDie } from "../dice";
import { SpecialtyPlayer } from "./SpecialtyPlayer";

export default class GreenGatsby extends SpecialtyPlayer {
  constructor() {
    super("Green Gatsby", GreenDie);
  }
}
