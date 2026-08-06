import { GreenDie } from "../dice";
import { SpecialtyPlayer } from "./SpecialtyPlayer";

/**
 * AI player that prefers green dice when drafting and trading.
 *
 * Green Gatsby targets green dice during the draft and will trade clear dice
 * specifically for green dice held by opponents.
 */
export default class GreenGatsby extends SpecialtyPlayer {
  constructor() {
    super("Green Gatsby", GreenDie);
  }
}
