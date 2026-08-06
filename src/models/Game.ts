import DiceBag from "./DiceBag";
import Die from "./core/Die";
import { ClearDie, PinkDie } from "./dice";
import Player from "./core/Player";

const NUM_ROUNDS = 10;

const PITY_DICE_THRESHOLDS: Array<{ maxPlayers: number; numDice: number }> = [
  { maxPlayers: 3, numDice: 1 },
  { maxPlayers: 6, numDice: 2 },
  { maxPlayers: 9, numDice: 3 },
];

type GamePhase = 'idle' | 'round-ready' | 'awaiting-pick' | 'gameover';

export interface LogEntry {
  round: number;
  msg: string;
}

export default class Game {
  public round: number = 1;
  public phase: GamePhase = 'idle';
  public finished: boolean = false;

  public diceBag: DiceBag;
  public dicePool: Die[] = [];
  public pickOrder: Player[] = [];
  public tradeOrder: Player[] = [];
  public pityDice: PinkDie[] = [];
  public log: LogEntry[] = [];

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

  private getPityDice(numPlayers: number): PinkDie[] {
    const threshold = PITY_DICE_THRESHOLDS.find((t) => numPlayers <= t.maxPlayers);
    const numOfDice = threshold ? threshold.numDice : 4;
    return Array.from({ length: numOfDice }, () => new PinkDie(12));
  }

  private addLog(msg: string): void {
    this.log.push({ round: this.round, msg });
  }

  public playRound(): void {
    this.addLog(`Round ${this.round} — rolling dice.`);
    this.rollAndScore();
    this.collectPityDice();

    if (this.round === NUM_ROUNDS) {
      this.finished = true;
      this.addLog('Final round complete — match over.');
      return;
    }

    const rankedPlayers = this.rankPlayersByRoundScore();
    this.distributePityDice(rankedPlayers);

    const yellowRanked = this.computeYellowRanking();
    this.dicePool = this.diceBag.drawRandomDice(this.players.length + 1);

    const humanIndex = yellowRanked.findIndex((p) => p.isHuman);
    if (humanIndex !== -1) {
      this.executePlayerPicks(yellowRanked.slice(0, humanIndex));
      this.pickOrder = yellowRanked.slice(humanIndex + 1);
      this.phase = 'awaiting-pick';
      return;
    }

    this.executePlayerPicks(yellowRanked);
    this.pickOrder = [];
    this.finalizeDraft();
  }

  private rollAndScore(): void {
    this.players.forEach((player) => {
      player.beginRound();
      player.rollDice();
      player.sumScore();
      this.addLog(`${player.name} scores ${player.roundScore} this round.`);
    });
  }

  private collectPityDice(): void {
    this.players.forEach((player) => {
      const pinkDice = player.dice.filter((die): die is PinkDie => die instanceof PinkDie);
      player.dice = player.dice.filter((die) => !(die instanceof PinkDie));
      this.pityDice.push(...pinkDice);
    });
  }

  private rankPlayersByRoundScore(): Player[] {
    return [...this.players].sort((a, b) => {
      if (b.roundScore !== a.roundScore) return b.roundScore - a.roundScore;
      return b.totalScore - a.totalScore;
    });
  }

  private distributePityDice(rankedPlayers: Player[]): void {
    const numPityDice = this.pityDice.length;
    rankedPlayers.slice(-numPityDice).forEach((player, index) => {
      const die = this.pityDice[index];
      if (die) {
        player.dice.push(die);
        this.addLog(`${player.name} receives a pink pity die.`);
      }
    });
    this.pityDice = [];
  }

  private computeYellowRanking(): Player[] {
    const getYellowScore = (player: Player) =>
      player.scores[player.scores.length - 1]?.yellow ?? 0;

    const playersWithScores = this.players.map((p) => ({
      player: p,
      yellow: getYellowScore(p),
      reroll: 0,
    }));

    playersWithScores.forEach((entry) => {
      const hasTie = playersWithScores.some(
        (other) => other !== entry && other.yellow === entry.yellow,
      );
      if (hasTie) entry.reroll = entry.player.computeYellowTiebreaker();
    });

    const yellowRanked = playersWithScores
      .sort((a, b) => b.yellow - a.yellow || b.reroll - a.reroll)
      .map((entry) => entry.player);

    this.players.forEach((p) => { p.hasPandaToken = false; });
    const pandaHolder = yellowRanked[0];
    if (pandaHolder) {
      pandaHolder.hasPandaToken = true;
      this.addLog(`${pandaHolder.name} earns the panda token and drafts first.`);
    }

    return yellowRanked;
  }

  private executePlayerPicks(players: Player[]): void {
    for (const player of players) {
      const before = [...this.dicePool];
      const result = player.chooseDie(this.dicePool);
      if (result) {
        const picked = before.find((d) => !result.includes(d));
        if (picked) this.addLog(`${player.name} picks a ${picked.color ?? 'clear'} d${picked.sides}.`);
        this.dicePool = result;
      }
    }
  }

  public userPickDie(die: Die): void {
    if (this.phase !== 'awaiting-pick') return;
    if (!this.dicePool.includes(die)) return;

    this.dicePool = this.dicePool.filter((d) => d !== die);
    const human = this.players.find((p) => p.isHuman);
    if (human) {
      human.dice.push(die);
      this.addLog(`${human.name} picks a ${die.color ?? 'clear'} d${die.sides}.`);
    }
    this.finalizeDraft();
  }

  public finalizeDraft(): void {
    this.executePlayerPicks(this.pickOrder);
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
      const trades = player.tradeDie(this.players.filter((p) => p !== player));
      for (const { gave, got, opponent } of trades) {
        this.addLog(`${player.name} trades a clear d${gave.sides} for ${opponent.name}'s ${got.color ?? 'clear'} d${got.sides}.`);
      }
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

  public determineWinner(): Player | undefined {
    return [...this.players].sort((a, b) => b.totalScore - a.totalScore)[0];
  }
}
