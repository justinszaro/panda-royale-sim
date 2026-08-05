import Die from "../core/Die";
import Player from "../core/Player";

export default class HumanPlayer extends Player {
  constructor() {
    super("Human");
    this.isHuman = true;
  }

  public chooseDie(_dice: Die[]): Die[] | undefined {
    throw new Error('Human picks are driven by Game.userPickDie, not chooseDie');
  }
}
