import DiceBag from "./DiceBag";
import { PinkDie } from "./dice";
import Player from "./core/Player";

const NUM_ROUNDS = 10;

export default class Game {
  public round: number = 1;

  public diceBag: DiceBag;
  public pityDice: PinkDie[] = [];

  public players: Player[] = [];

  constructor(players: Player[]) {
    this.round = 1;
    this.diceBag = new DiceBag();
    this.players = players;

    this.pityDice = this.getPityDice(players.length);
  }

  public getRound(): number {
    return this.round;
  }

  public setRound(round: number): void {
    if (!Number.isInteger(round) || round < 1) {
      throw new RangeError("round must be an integer >= 1");
    }

    this.round = Math.min(round, NUM_ROUNDS);
  }

  private getPityDice(numPlayers: number) {
    let numOfDice;
    if (numPlayers <= 3) numOfDice = 1;
    if (numPlayers <= 6) numOfDice = 2;
    if (numPlayers <= 9) numOfDice = 3;
    if (numPlayers <= 10) numOfDice = 4;

    return new Array(numOfDice).fill(null).map(() => new PinkDie(12));
  }

  public playRound() {
    this.players.forEach((player: Player) => {
      player.beginRound();
      player.rollDice();
      player.sumScore();
    });

    const scores = [...this.players].sort(
      (a, b) => b.roundScore - a.roundScore,
    );

    // TODO: Someone gets a panda token.
    // TODO: Lowest score gets the pity dice.
    let diceForGrabs = this.diceBag.drawRandomDice(this.players.length + 1);
    this.players.forEach((player: Player) => {
      const result = player.chooseDie(diceForGrabs);
      if (result) {
        diceForGrabs = result;
      }
    });

    this.setRound(this.getRound() + 1);
  }

  public determineWinner() {
    const sortedPlayers = [...this.players].sort(
      (a, b) =>
        b.scores.reduce((acc, score) => acc + score.total, 0) -
        a.scores.reduce((acc, score) => acc + score.total, 0),
    );
    return sortedPlayers[0];
  }
}
