import { describe, it, expect, vi, afterEach } from 'vitest';
import Game from '../../src/models/Game';
import Player from '../../src/models/core/Player';
import HumanPlayer from '../../src/models/players/HumanPlayer';
import { ClearDie, PinkDie, YellowDie } from '../../src/models/dice';

afterEach(() => {
  vi.restoreAllMocks();
});

function makePlayers(n: number): Player[] {
  return Array.from({ length: n }, (_, i) => new Player(`P${i + 1}`));
}

function makeGame(n = 2): Game {
  return new Game(makePlayers(n));
}

// ─── constructor ─────────────────────────────────────────────────────────────

describe('Game constructor', () => {
  it('starts at round 1 with phase idle and not finished', () => {
    const g = makeGame();
    expect(g.round).toBe(1);
    expect(g.phase).toBe('idle');
    expect(g.finished).toBe(false);
  });

  it('stores the players passed in', () => {
    const players = makePlayers(3);
    expect(new Game(players).players).toBe(players);
  });

  it('initialises pity dice based on player count', () => {
    expect(new Game(makePlayers(2)).pityDice).toHaveLength(1);
    expect(new Game(makePlayers(3)).pityDice).toHaveLength(1);
    expect(new Game(makePlayers(4)).pityDice).toHaveLength(2);
    expect(new Game(makePlayers(6)).pityDice).toHaveLength(2);
    expect(new Game(makePlayers(7)).pityDice).toHaveLength(3);
    expect(new Game(makePlayers(9)).pityDice).toHaveLength(3);
    expect(new Game(makePlayers(10)).pityDice).toHaveLength(4);
  });

  it('pity dice are PinkDie with 12 sides', () => {
    const g = makeGame(4);
    expect(g.pityDice.every((d) => d instanceof PinkDie && d.sides === 12)).toBe(true);
  });
});

// ─── setRound / getRound ──────────────────────────────────────────────────────

describe('setRound()', () => {
  it('updates the round number', () => {
    const g = makeGame();
    g.setRound(5);
    expect(g.getRound()).toBe(5);
  });

  it('clamps at NUM_ROUNDS (10)', () => {
    const g = makeGame();
    g.setRound(99);
    expect(g.round).toBe(10);
  });

  it('throws for non-integer input', () => {
    expect(() => makeGame().setRound(1.5)).toThrow(RangeError);
  });

  it('throws for values less than 1', () => {
    expect(() => makeGame().setRound(0)).toThrow(RangeError);
  });
});

// ─── playRound ────────────────────────────────────────────────────────────────

describe('playRound()', () => {
  it('scores all players and advances the round', () => {
    const g = makeGame(2);
    g.playRound();
    g.players.forEach((p) => expect(p.scores).toHaveLength(1));
    expect(g.round).toBe(2);
  });

  it('sets finished=true after round 10', () => {
    const g = makeGame(2);
    g.setRound(10);
    g.playRound();
    expect(g.finished).toBe(true);
  });

  it('does not advance round after the final round', () => {
    const g = makeGame(2);
    g.setRound(10);
    g.playRound();
    expect(g.round).toBe(10);
  });

  it('awards the panda token to the player with the highest yellow score', () => {
    const g = makeGame(2);
    const [p1, p2] = g.players as [Player, Player];

    // Give p1 a high yellow value, p2 a low one
    p1.dice = [new YellowDie(6)];
    p2.dice = [new YellowDie(6)];
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(5 / 6) // p1 yellow roll → 6
      .mockReturnValueOnce(0)     // p2 yellow roll → 1
      .mockReturnValue(0);        // everything else

    g.playRound();

    expect(p1.hasPandaToken).toBe(true);
    expect(p2.hasPandaToken).toBe(false);
  });

  it('collects PinkDice from players into the pity pool then distributes', () => {
    const g = makeGame(3);
    const pink = new PinkDie(12);
    g.players[0]!.dice.push(pink);

    g.playRound();

    // Pink die should no longer be on the player after collection
    expect(g.players[0]!.dice).not.toContain(pink);
  });

  it('sets phase to awaiting-pick when a human player is present', () => {
    const human = new HumanPlayer();
    const ai = new Player('AI');
    const g = new Game([human, ai]);
    g.playRound();
    expect(g.phase).toBe('awaiting-pick');
  });

  it('leaves dicePool populated while awaiting human pick', () => {
    const human = new HumanPlayer();
    const g = new Game([human, new Player('AI')]);
    g.playRound();
    expect(g.dicePool.length).toBeGreaterThan(0);
  });
});

// ─── userPickDie ──────────────────────────────────────────────────────────────

describe('userPickDie()', () => {
  function gameAwaitingPick() {
    const human = new HumanPlayer();
    const ai = new Player('AI');
    const g = new Game([human, ai]);
    g.playRound();
    return { g, human };
  }

  it('adds the chosen die to the human player', () => {
    const { g, human } = gameAwaitingPick();
    const die = g.dicePool[0]!;
    const before = human.dice.length;
    g.userPickDie(die);
    expect(human.dice.length).toBe(before + 1);
    expect(human.dice).toContain(die);
  });

  it('removes the die from the pool', () => {
    const { g } = gameAwaitingPick();
    const die = g.dicePool[0]!;
    g.userPickDie(die);
    expect(g.dicePool).not.toContain(die);
  });

  it('advances the round after picking', () => {
    const { g } = gameAwaitingPick();
    const die = g.dicePool[0]!;
    g.userPickDie(die);
    expect(g.round).toBe(2);
    expect(g.phase).toBe('round-ready');
  });

  it('ignores calls when phase is not awaiting-pick', () => {
    const g = makeGame(2);
    const fakePool = [new YellowDie(6)];
    g.dicePool = fakePool;
    g.userPickDie(fakePool[0]!); // phase is still 'idle'
    expect(g.dicePool).toContain(fakePool[0]);
  });

  it('ignores a die that is not in the pool', () => {
    const { g, human } = gameAwaitingPick();
    const stranger = new YellowDie(6);
    const before = human.dice.length;
    g.userPickDie(stranger);
    expect(human.dice.length).toBe(before);
  });
});

// ─── userTradeDie ─────────────────────────────────────────────────────────────

describe('userTradeDie()', () => {
  it('swaps a clear die from the human with a die from the pool', () => {
    const human = new HumanPlayer();
    const ai = new Player('AI');
    const g = new Game([human, ai]);

    const clearDie = new ClearDie(6, false);
    human.dice = [clearDie];
    const poolDie = new YellowDie(6);
    g.dicePool = [poolDie];
    g.phase = 'awaiting-pick' as any;

    g.userTradeDie(clearDie.id, poolDie.id);

    expect(human.dice).toContain(poolDie);
    expect(human.dice).not.toContain(clearDie);
    expect(g.dicePool).toContain(clearDie);
    expect(g.dicePool).not.toContain(poolDie);
  });

  it('ignores calls when phase is not awaiting-pick', () => {
    const human = new HumanPlayer();
    const g = new Game([human]);
    const clearDie = new ClearDie(6, false);
    human.dice = [clearDie];
    g.dicePool = [new YellowDie(6)];

    g.userTradeDie(clearDie.id, g.dicePool[0]!.id);

    expect(human.dice).toContain(clearDie);
  });
});

// ─── determineWinner ──────────────────────────────────────────────────────────

describe('determineWinner()', () => {
  it('returns the player with the highest total score', () => {
    const g = makeGame(3);
    const [p1, p2, p3] = g.players as [Player, Player, Player];

    p1.beginRound();
    p1.dice = [new YellowDie(6)];
    p1.dice[0]!.value = 2;
    p1.sumScore();

    p2.beginRound();
    p2.dice = [new YellowDie(6)];
    p2.dice[0]!.value = 6;
    p2.sumScore();

    p3.beginRound();
    p3.dice = [new YellowDie(6)];
    p3.dice[0]!.value = 4;
    p3.sumScore();

    expect(g.determineWinner()).toBe(p2);
  });

  it('returns undefined for a game with no players', () => {
    const g = new Game([]);
    expect(g.determineWinner()).toBeUndefined();
  });
});

// ─── skipToEnd ────────────────────────────────────────────────────────────────

describe('skipToEnd()', () => {
  it('runs all 10 rounds and marks the game finished', () => {
    const g = makeGame(3);
    g.skipToEnd();
    expect(g.finished).toBe(true);
    expect(g.round).toBe(10);
  });

  it('each player has 10 score entries after a full game', () => {
    const g = makeGame(2);
    g.skipToEnd();
    g.players.forEach((p) => expect(p.scores).toHaveLength(10));
  });

  it('produces a winner', () => {
    const g = makeGame(3);
    g.skipToEnd();
    expect(g.determineWinner()).toBeDefined();
  });
});
