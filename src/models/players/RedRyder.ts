import { RedDie } from "../dice";
import { SpecialtyPlayer } from "./SpecialtyPlayer";

/**
 * AI player that prefers red dice when drafting and trading.
 *
 * Red Ryder targets red dice during the draft and will trade clear dice
 * specifically for red dice held by opponents, maximising the multiplicative
 * red scoring bonus.
 */
export default class RedRyder extends SpecialtyPlayer {
  constructor() {
    super("Red Ryder", RedDie);
  }
}
