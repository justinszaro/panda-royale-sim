import { BlueDie } from "../dice";
import { SpecialtyPlayer } from "./SpecialtyPlayer";

/**
 * AI player that prefers blue dice when drafting and trading.
 *
 * Blue Ben targets blue dice during the draft and will trade clear dice
 * specifically for blue dice held by opponents.
 */
export default class BlueBen extends SpecialtyPlayer {
  constructor() {
    super("Blue Ben", BlueDie);
  }
}
