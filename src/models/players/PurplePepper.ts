import { PurpleDie } from "../dice";
import { SpecialtyPlayer } from "./SpecialtyPlayer";

/**
 * AI player that prefers purple dice when drafting and trading.
 *
 * Purple Pepper targets purple dice during the draft and will trade clear dice
 * specifically for purple dice held by opponents, exploiting the ×2 scoring
 * multiplier on purple die totals.
 */
export default class PurplePepper extends SpecialtyPlayer {
  constructor() {
    super("Purple Pepper", PurpleDie);
  }
}
