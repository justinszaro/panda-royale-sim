import DiceBag from "./DiceBag";
import Die from "./core/Die";
import { ClearDie, PinkDie } from "./dice";
import Player from "./core/Player";

const NUM_ROUNDS = 10;

type GamePhase = 'idle' | 'round-ready' | 'awaiting-pick' | 'gameover';

export default class Game {
  public round: number = 1;
  public phase: GamePhase = 'idle';
  public finished: boolean = false;

  public diceBag: DiceBag;
  public dicePool: Die[] = [];
  public pickOrder: Player[] = [];
  public tradeOrder: Player[] = [];
  public pityDice: PinkDie[] = [];

  public players: Player[] = [];

  constructor(players: Player[]) {
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

    this.players.forEach((player) => {
      const pinkDice = player.dice.filter((die): die is PinkDie => die instanceof PinkDie);
      player.dice = player.dice.filter((die) => !(die instanceof PinkDie));
      this.pityDice.push(...pinkDice);
    });

    if (this.round === NUM_ROUNDS) {
      this.finished = true;
      this.finish();
    }

    const scores = [...this.players].sort((a, b) => {
      if (b.roundScore !== a.roundScore) return b.roundScore - a.roundScore;
      const aTotal = a.scores.reduce((acc, s) => acc + s.total, 0);
      const bTotal = b.scores.reduce((acc, s) => acc + s.total, 0);
      return bTotal - aTotal;
    });

    const numPityDice = this.pityDice.length;
    scores.slice(-numPityDice).forEach((player, index) => {
      const die = this.pityDice[index];
      if (die) player.dice.push(die);
    });
    this.pityDice = [];

    const getYellowScore = (player: Player) =>
      player.scores[player.scores.length - 1]?.yellow ?? 0;

    // Pre-compute re-rolls for any tied yellow scores before sorting
    const playersWithScores = this.players.map((p) => ({
      player: p,
      yellow: getYellowScore(p),
      reroll: 0,
    }));
    playersWithScores.forEach((entry) => {
      const hasTie = playersWithScores.some(
        (other) => other !== entry && other.yellow === entry.yellow,
      );
      if (hasTie) entry.reroll = entry.player.reRollYellowDice();
    });

    const yellowRanked = playersWithScores
      .sort((a, b) => b.yellow - a.yellow || b.reroll - a.reroll)
      .map((entry) => entry.player);

    // Highest yellow scorer gets the panda token
    this.players.forEach((p) => { p.hasPandaToken = false; });
    const pandaHolder = yellowRanked[0];
    if (pandaHolder) pandaHolder.hasPandaToken = true;

    // Pick dice in yellow score order (highest to lowest)
    this.dicePool = this.diceBag.drawRandomDice(this.players.length + 1);

    const humanIndex = yellowRanked.findIndex((p) => p.isHuman);
    if (humanIndex !== -1) {
      for (const player of yellowRanked.slice(0, humanIndex)) {
        const result = player.chooseDie(this.dicePool);
        if (result) this.dicePool = result;
      }
      this.pickOrder = yellowRanked.slice(humanIndex + 1);
      this.phase = 'awaiting-pick';
      return;
    }

    for (const player of yellowRanked) {
      const result = player.chooseDie(this.dicePool);
      if (result) this.dicePool = result;
    }
    this.pickOrder = [];
    this.finalizeDraft();
  }

  public userPickDie(die: Die): void {
    if (this.phase !== 'awaiting-pick') return;
    if (!this.dicePool.includes(die)) return;

    this.dicePool = this.dicePool.filter((d) => d !== die);
    const human = this.players.find((p) => p.isHuman);
    if (human) human.dice.push(die);
    this.finalizeDraft();
  }

  public finalizeDraft(): void {
    for (const player of this.pickOrder) {
      const result = player.chooseDie(this.dicePool);
      if (result) this.dicePool = result;
    }
    this.pickOrder = [];
    this.diceBag.returnDice(this.dicePool);
    this.dicePool = [];

    const pandaHolder = this.players.find((p) => p.hasPandaToken);
    const pandaIndex = pandaHolder ? this.players.indexOf(pandaHolder) : -1;
    this.tradeOrder = [
      ...this.players.slice(pandaIndex + 1),
      ...this.players.slice(0, pandaIndex + 1),
    ];
    this.finalizeTrading();
  }

  public userTradeDie(clearDieId: string, poolDieId: string): void {
    if (this.phase !== 'awaiting-pick') return;

    const human = this.players.find((p) => p.isHuman);
    if (!human) return;

    const clearDie = human.dice.find(
      (d): d is ClearDie => d instanceof ClearDie && d.id === clearDieId,
    );
    if (!clearDie) return;

    const poolDie = this.dicePool.find((d) => d.id === poolDieId);
    if (!poolDie) return;

    human.dice = human.dice.filter((d) => d !== clearDie);
    this.dicePool = this.dicePool.filter((d) => d !== poolDie);
    this.dicePool.push(clearDie);
    human.dice.push(poolDie);
  }

  public finalizeTrading(): void {
    while (this.tradeOrder.length > 0) {
      const player = this.tradeOrder.shift()!;
      player.tradeDie(this.players.filter((p) => p !== player));
    }

    this.setRound(this.getRound() + 1);
    this.phase = 'round-ready';
  }

  public skipToEnd(): void {
    while (!this.finished) {
      this.playRound();
      if (this.phase === 'awaiting-pick') {
        const randomDie = this.dicePool[Math.floor(Math.random() * this.dicePool.length)];
        if (randomDie) this.userPickDie(randomDie);
      }
    }
  }

  public determineWinner() {
    const sortedPlayers = [...this.players].sort(
      (a, b) =>
        b.scores.reduce((acc, score) => acc + score.total, 0) -
        a.scores.reduce((acc, score) => acc + score.total, 0),
    );
    return sortedPlayers[0];
  }

  public finish() {
    continue;
  }
}
