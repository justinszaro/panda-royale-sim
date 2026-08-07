import DiceBag from "./DiceBag";
import Die from "./core/Die";
import { ClearDie, PinkDie } from "./dice";
import Player from "./core/Player";

/** Total number of rounds in a standard match. */
const NUM_ROUNDS = 10;

/**
 * Lookup table mapping player-count ranges to the number of pink pity dice
 * awarded each round. Players beyond the highest threshold receive 4 dice.
 */
const PITY_DICE_THRESHOLDS: Array<{ maxPlayers: number; numDice: number }> = [
  { maxPlayers: 3, numDice: 1 },
  { maxPlayers: 6, numDice: 2 },
  { maxPlayers: 9, numDice: 3 },
];

/**
 * Describes the current state of the game loop.
 *
 * - `idle` — game not yet started.
 * - `round-ready` — ready to begin the next round.
 * - `awaiting-pick` — a human player must call {@link Game.userPickDie} before
 *   the draft can continue.
 * - `awaiting-trade` — a human player must call {@link Game.userMakeTrade} or
 *   {@link Game.userFinishTrading} before the trading phase can continue.
 * - `gameover` — all rounds have been played.
 */
type GamePhase = 'idle' | 'round-ready' | 'awaiting-pick' | 'awaiting-trade' | 'gameover';

/** A single entry in the game log, associated with a round number. */
export interface LogEntry {
  round: number;
  msg: string;
}

/**
 * Orchestrates a full Panda Royale match.
 *
 * Call {@link playRound} each turn to advance the game. When a human player is
 * present, `playRound` may pause at `phase === 'awaiting-pick'`; resume with
 * {@link userPickDie} (and optionally {@link userTradeDie}) followed by
 * {@link finalizeDraft}. Use {@link skipToEnd} to simulate a complete game
 * without human interaction.
 */
export default class Game {
  /** Current round number (1-based). */
  public round: number = 1;

  /** Current phase of the game loop. */
  public phase: GamePhase = 'idle';

  /** `true` once the final round has been completed. */
  public finished: boolean = false;

  /** The shared bag from which dice are drawn each round. */
  public diceBag: DiceBag;

  /** Dice currently available for players to pick from during the draft. */
  public dicePool: Die[] = [];

  /**
   * Players still waiting to pick after a human interruption, in draft order.
   * Empty when no human player is in the game.
   */
  public pickOrder: Player[] = [];

  /** Players ordered for the trading phase (starting after the panda-token holder). */
  public tradeOrder: Player[] = [];

  /** Pink pity dice collected at the end of each round for redistribution. */
  public pityDice: PinkDie[] = [];

  /** Chronological log of game events. */
  public log: LogEntry[] = [];

  /** All players participating in the match. */
  public players: Player[] = [];

  /**
   * @param players - Players joining the match. Include a {@link HumanPlayer}
   *   instance to enable interactive mode.
   */
  constructor(players: Player[]) {
    this.diceBag = new DiceBag();
    this.players = players;

    this.pityDice = this.getPityDice(players.length);
  }

  /**
   * Returns the current round number.
   *
   * @returns The 1-based round number.
   */
  public getRound(): number {
    return this.round;
  }

  /**
   * Sets the current round, clamping to the range `[1, NUM_ROUNDS]`.
   *
   * @param round - Target round number; must be a positive integer.
   * @throws {RangeError} If `round` is not a positive integer.
   */
  public setRound(round: number): void {
    if (!Number.isInteger(round) || round < 1) {
      throw new RangeError("round must be an integer >= 1");
    }

    this.round = Math.min(round, NUM_ROUNDS);
  }

  /**
   * Determines how many pink pity dice to use based on the number of players.
   *
   * @param numPlayers - Total number of players in the game.
   * @returns An array of freshly created {@link PinkDie} instances.
   */
  private getPityDice(numPlayers: number): PinkDie[] {
    const threshold = PITY_DICE_THRESHOLDS.find((t) => numPlayers <= t.maxPlayers);
    const numOfDice = threshold ? threshold.numDice : 4;
    return Array.from({ length: numOfDice }, () => new PinkDie(12));
  }

  /**
   * Appends a message to the game log, tagged with the current round.
   *
   * @param msg - Human-readable description of the event.
   */
  private addLog(msg: string): void {
    this.log.push({ round: this.round, msg });
  }

  /**
   * Advances the game by one round.
   *
   * The method handles rolling, scoring, pity-die redistribution, yellow-die
   * ranking, and the draft. When a human player is present the method pauses
   * at `phase === 'awaiting-pick'` after auto-picking for all players who rank
   * ahead of the human; call {@link userPickDie} then {@link finalizeDraft} to
   * continue.
   */
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

  /**
   * Runs the roll-and-score phase: each player rolls their dice and records a
   * round score.
   */
  private rollAndScore(): void {
    this.players.forEach((player) => {
      player.beginRound();
      player.rollDice();
      player.sumScore();
      this.addLog(`${player.name} scores ${player.roundScore} this round.`);
    });
  }

  /**
   * Collects all pink dice from players' hands back into the pity pool so they
   * can be redistributed after ranking.
   */
  private collectPityDice(): void {
    this.players.forEach((player) => {
      const pinkDice = player.dice.filter((die): die is PinkDie => die instanceof PinkDie);
      player.dice = player.dice.filter((die) => !(die instanceof PinkDie));
      this.pityDice.push(...pinkDice);
    });
  }

  /**
   * Sorts all players by their round score descending, using the cumulative
   * total score as a tiebreaker.
   *
   * @returns A new array of players sorted from highest to lowest round score.
   */
  private rankPlayersByRoundScore(): Player[] {
    return [...this.players].sort((a, b) => {
      if (b.roundScore !== a.roundScore) return b.roundScore - a.roundScore;
      return b.totalScore - a.totalScore;
    });
  }

  /**
   * Gives a pity die to each of the lowest-ranked players (tail of the ranked
   * array). Clears {@link pityDice} after distribution.
   *
   * @param rankedPlayers - Players sorted from highest to lowest round score.
   */
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

  /**
   * Determines draft order by ranking players on their yellow-die total for
   * this round. Ties are broken by a fresh tiebreaker roll. Assigns the panda
   * token to the highest-ranked player.
   *
   * @returns Players sorted from highest to lowest yellow score.
   */
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

  /**
   * Runs the AI pick phase for a subset of players, consuming dice from
   * {@link dicePool} in order.
   *
   * @param players - Players who should pick now, in draft order.
   */
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

  /**
   * Handles the human player's die pick during `'awaiting-pick'` phase.
   *
   * Does nothing if the game is not awaiting a pick or if the chosen die is
   * not in the current pool. After a valid pick, calls {@link finalizeDraft}
   * automatically.
   *
   * @param die - The die the human player has chosen from {@link dicePool}.
   */
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

  /**
   * Completes the draft phase: lets remaining AI players pick, returns leftover
   * dice to the bag, and kicks off the trading phase.
   *
   * Call this after {@link userPickDie} (and any {@link userTradeDie} calls)
   * when a human is in the game, or call it directly in fully automated games.
   */
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

  /**
   * Allows the human player to trade one of their clear dice for a specific die
   * in the current pool during the `'awaiting-pick'` phase.
   *
   * Does nothing if the game is not in the awaiting-pick state, if no human
   * player exists, or if either die cannot be found.
   *
   * @param clearDieId - ID of the clear die in the human player's hand to give away.
   * @param poolDieId - ID of the die in {@link dicePool} to receive.
   */
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

  /**
   * Runs the trading phase for all players in {@link tradeOrder}. When the
   * human player's turn is reached and they hold at least one tradable clear
   * die, the method pauses at `phase === 'awaiting-trade'`. Resume by calling
   * {@link userMakeTrade} (once per trade) and {@link userFinishTrading} when
   * done. After all players have traded, advances the round counter and sets
   * `phase` to `'round-ready'`.
   */
  public finalizeTrading(): void {
    while (this.tradeOrder.length > 0) {
      const player = this.tradeOrder[0]!;

      if (player.isHuman) {
        const hasTradableClear = player.dice.some(
          (d): d is ClearDie => d instanceof ClearDie && !d.isTradable,
        );
        if (hasTradableClear) {
          this.phase = 'awaiting-trade';
          return;
        }
      }

      this.tradeOrder.shift();
      const trades = player.tradeDie(this.players.filter((p) => p !== player));
      for (const { gave, got, opponent } of trades) {
        this.addLog(`${player.name} trades a clear d${gave.sides} for ${opponent.name}'s ${got.color ?? 'clear'} d${got.sides}.`);
      }
    }

    this.setRound(this.getRound() + 1);
    this.phase = 'round-ready';
  }

  /**
   * Executes one trade for the human player during the `'awaiting-trade'`
   * phase: gives away a clear die and receives a non-pink, non-clear die from
   * the chosen opponent.
   *
   * Does nothing if the phase is wrong, either die cannot be found, or the
   * target die is pink or clear.
   *
   * @param clearDieId - ID of the clear die in the human's hand to give away.
   * @param opponentId - ID of the opponent player to trade with.
   * @param targetDieId - ID of the opponent's die to receive.
   */
  public userMakeTrade(clearDieId: string, opponentId: string, targetDieId: string): void {
    if (this.phase !== 'awaiting-trade') return;

    const human = this.players.find((p) => p.isHuman);
    if (!human) return;

    const clearDie = human.dice.find(
      (d): d is ClearDie => d instanceof ClearDie && d.id === clearDieId && !d.isTradable,
    );
    if (!clearDie) return;

    const opponent = this.players.find((p) => p.id === opponentId && !p.isHuman);
    if (!opponent) return;

    const targetDie = opponent.dice.find(
      (d) => d.id === targetDieId && !(d instanceof ClearDie) && !(d instanceof PinkDie),
    );
    if (!targetDie) return;

    clearDie.isTradable = true;
    human.dice = human.dice.filter((d) => d !== clearDie);
    opponent.dice = opponent.dice.filter((d) => d !== targetDie);
    human.dice.push(targetDie);
    opponent.dice.push(clearDie);

    this.addLog(`${human.name} trades a clear d${clearDie.sides} for ${opponent.name}'s ${targetDie.color ?? 'clear'} d${targetDie.sides}.`);
  }

  /**
   * Signals that the human player is done trading for this round, advancing
   * past their turn in the trade order and resuming {@link finalizeTrading}
   * for any remaining AI players.
   */
  public userFinishTrading(): void {
    if (this.phase !== 'awaiting-trade') return;
    this.tradeOrder.shift();
    this.finalizeTrading();
  }

  /**
   * Simulates the remainder of the game automatically, making random picks on
   * behalf of any human player. Useful for testing and simulation runs.
   */
  public skipToEnd(): void {
    while (!this.finished) {
      this.playRound();
      if (this.phase === 'awaiting-pick') {
        const randomDie = this.dicePool[Math.floor(Math.random() * this.dicePool.length)];
        if (randomDie) this.userPickDie(randomDie);
      }
      if (this.phase === 'awaiting-trade') {
        this.userFinishTrading();
      }
    }
  }

  /**
   * Returns the player with the highest cumulative score, or `undefined` if
   * there are no players.
   *
   * @returns The winning {@link Player}, or `undefined`.
   */
  public determineWinner(): Player | undefined {
    return [...this.players].sort((a, b) => b.totalScore - a.totalScore)[0];
  }
}
