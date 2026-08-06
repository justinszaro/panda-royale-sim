import { describe, it, expect, vi, afterEach } from 'vitest';
import Player from '../../../src/models/core/Player';
import {
  BlueDie,
  ClearDie,
  GreenDie,
  PinkDie,
  PurpleDie,
  RedDie,
  YellowDie,
} from '../../../src/models/dice';

afterEach(() => {
  vi.restoreAllMocks();
});

function makePlayer(name = 'Test'): Player {
  return new Player(name);
}

describe('Player constructor', () => {
  it('sets name', () => {
    expect(makePlayer('Alice').name).toBe('Alice');
  });

  it('assigns a unique id per instance', () => {
    expect(makePlayer().id).not.toBe(makePlayer().id);
  });

  it('starts with one YellowDie', () => {
    const p = makePlayer();
    expect(p.dice).toHaveLength(1);
    expect(p.dice[0]).toBeInstanceOf(YellowDie);
  });

  it('starts with roundScore 0 and empty scores', () => {
    const p = makePlayer();
    expect(p.roundScore).toBe(0);
    expect(p.scores).toHaveLength(0);
  });

  it('isHuman defaults to false', () => {
    expect(makePlayer().isHuman).toBe(false);
  });
});

describe('beginRound()', () => {
  it('pushes a zeroed RoundScore onto scores', () => {
    const p = makePlayer();
    p.beginRound();
    expect(p.scores).toHaveLength(1);
    expect(p.scores[0]).toEqual({ yellow: 0, purple: 0, blue: 0, red: 0, green: 0, clear: 0, pink: 0, total: 0 });
  });

  it('accumulates a score per call', () => {
    const p = makePlayer();
    p.beginRound();
    p.beginRound();
    expect(p.scores).toHaveLength(2);
  });
});

describe('rollDice()', () => {
  it('sets a value on every die', () => {
    const p = makePlayer();
    p.dice.push(new BlueDie(6));
    p.rollDice();
    p.dice.forEach((d) => expect(d.value).not.toBeNull());
  });
});

describe('computeYellowTiebreaker()', () => {
  it('returns a number >= number of yellow dice (all sides >= 1)', () => {
    const p = makePlayer();
    p.dice.push(new YellowDie(6));
    const result = p.computeYellowTiebreaker();
    expect(result).toBeGreaterThanOrEqual(2);
  });

  it('returns 0 when the player has no yellow dice', () => {
    const p = makePlayer();
    p.dice = [new BlueDie(6)];
    expect(p.computeYellowTiebreaker()).toBe(0);
  });
});

describe('chooseDie()', () => {
  it('returns undefined for an empty pool', () => {
    expect(makePlayer().chooseDie([])).toBeUndefined();
  });

  it('adds one die to player dice and removes it from the pool', () => {
    const p = makePlayer();
    const pool = [new BlueDie(6), new PurpleDie(8)];
    const remaining = p.chooseDie(pool);
    expect(p.dice).toHaveLength(2);
    expect(remaining).toHaveLength(1);
    expect(pool).toHaveLength(1);
  });

  it('seeks yellow first when shouldSeekYellow is true', () => {
    const p = makePlayer();
    p.shouldSeekYellow = true;
    const yellow = new YellowDie(6);
    const pool = [new BlueDie(6), yellow];
    p.chooseDie(pool);
    expect(p.dice).toContain(yellow);
  });

  it('falls back to random pick when shouldSeekYellow=true but no yellow in pool', () => {
    const p = makePlayer();
    p.shouldSeekYellow = true;
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const blue = new BlueDie(6);
    const pool = [blue, new PurpleDie(8)];
    p.chooseDie(pool);
    expect(p.dice).toContain(blue);
  });
});

describe('tradeDie()', () => {
  it('does nothing when the player has no clear dice', () => {
    const p = makePlayer();
    const opponent = makePlayer();
    const before = [...p.dice];
    p.tradeDie([opponent]);
    expect(p.dice).toEqual(before);
  });

  it('does nothing when the player list is empty', () => {
    const p = makePlayer();
    p.dice.push(new ClearDie(6, false));
    const initialLength = p.dice.length;
    p.tradeDie([]);
    expect(p.dice.length).toBe(initialLength);
  });

  it('swaps a clear die for an opponent die', () => {
    const p = makePlayer();
    const clearDie = new ClearDie(6, false);
    const opponentDie = new YellowDie(6);
    p.dice = [clearDie];

    const opponent = makePlayer();
    opponent.dice = [opponentDie];

    vi.spyOn(Math, 'random').mockReturnValue(0);
    p.tradeDie([opponent]);

    expect(p.dice).toContain(opponentDie);
    expect(p.dice).not.toContain(clearDie);
    expect(opponent.dice).toContain(clearDie);
    expect(opponent.dice).not.toContain(opponentDie);
  });

  it('skips trade when opponent has only clear dice', () => {
    const p = makePlayer();
    const clearDie = new ClearDie(6, false);
    p.dice = [clearDie];

    const opponent = makePlayer();
    opponent.dice = [new ClearDie(6, false)];

    p.tradeDie([opponent]);
    expect(p.dice).toContain(clearDie);
  });
});

describe('score calculation', () => {
  function scored(p: Player) {
    p.beginRound();
    return p;
  }

  it('sumYellowDice() sums yellow values', () => {
    const p = scored(makePlayer());
    const y = new YellowDie(6);
    y.value = 4;
    p.dice = [y];
    expect(p.sumYellowDice()).toBe(4);
    expect(p.scores[0]!.yellow).toBe(4);
  });

  it('sumPurpleDice() doubles the sum', () => {
    const p = scored(makePlayer());
    const pur = new PurpleDie(8);
    pur.value = 3;
    p.dice = [pur];
    expect(p.sumPurpleDice()).toBe(6);
    expect(p.scores[0]!.purple).toBe(6);
  });

  it('sumBlueDice() returns raw sum with no glittery dice', () => {
    const p = scored(makePlayer());
    const b = new BlueDie(6, false);
    b.value = 5;
    p.dice = [b];
    expect(p.sumBlueDice()).toBe(5);
  });

  it('sumBlueDice() doubles when any die is glittery', () => {
    const p = scored(makePlayer());
    const b1 = new BlueDie(6, false);
    b1.value = 3;
    const b2 = new BlueDie(6, true);
    b2.value = 2;
    p.dice = [b1, b2];
    expect(p.sumBlueDice()).toBe(10);
  });

  it('sumRedDice() multiplies sum by count', () => {
    const p = scored(makePlayer());
    const r1 = new RedDie(6);
    r1.value = 4;
    const r2 = new RedDie(6);
    r2.value = 5;
    p.dice = [r1, r2];
    expect(p.sumRedDice()).toBe(18);
  });

  it('sumRedDice() returns 0 when no red dice', () => {
    const p = scored(makePlayer());
    p.dice = [new YellowDie(6)];
    expect(p.sumRedDice()).toBe(0);
  });

  it('sumGreenDice() returns the single green die value', () => {
    const p = scored(makePlayer());
    const g = new GreenDie(20);
    g.value = 17;
    p.dice = [g];
    expect(p.sumGreenDice()).toBe(17);
    expect(p.scores[0]!.green).toBe(17);
  });

  it('sumGreenDice() returns 0 when no green die', () => {
    const p = scored(makePlayer());
    p.dice = [new YellowDie(6)];
    expect(p.sumGreenDice()).toBe(0);
  });

  it('sumClearDice() sums clear values', () => {
    const p = scored(makePlayer());
    const c1 = new ClearDie(6);
    c1.value = 3;
    const c2 = new ClearDie(6);
    c2.value = 4;
    p.dice = [c1, c2];
    expect(p.sumClearDice()).toBe(7);
  });

  it('sumPinkDice() returns the single pink die value', () => {
    const p = scored(makePlayer());
    const pk = new PinkDie(12);
    pk.value = 9;
    p.dice = [pk];
    expect(p.sumPinkDice()).toBe(9);
    expect(p.scores[0]!.pink).toBe(9);
  });

  it('sumPinkDice() returns 0 when no pink die', () => {
    const p = scored(makePlayer());
    p.dice = [];
    expect(p.sumPinkDice()).toBe(0);
  });

  it('sumScore() aggregates all colors and sets total', () => {
    const p = scored(makePlayer());
    const y = new YellowDie(6);
    y.value = 3;
    const pur = new PurpleDie(8);
    pur.value = 2;
    p.dice = [y, pur];
    const total = p.sumScore();
    // yellow=3, purple=4, everything else=0
    expect(total).toBe(7);
    expect(p.roundScore).toBe(7);
    expect(p.scores[0]!.total).toBe(7);
  });

  it('sumScore() auto-begins a round when none started', () => {
    const p = makePlayer();
    const y = new YellowDie(6);
    y.value = 5;
    p.dice = [y];
    expect(() => p.sumScore()).not.toThrow();
    expect(p.scores).toHaveLength(1);
  });
});

describe('totalScore getter', () => {
  it('sums all round totals', () => {
    const p = makePlayer();
    p.dice = [];

    p.beginRound();
    const y1 = new YellowDie(6);
    y1.value = 4;
    p.dice = [y1];
    p.sumScore();

    p.beginRound();
    const y2 = new YellowDie(6);
    y2.value = 6;
    p.dice = [y2];
    p.sumScore();

    expect(p.totalScore).toBe(10);
  });
});

describe('roundScoreTotals getter', () => {
  it('returns an array of per-round totals', () => {
    const p = makePlayer();

    p.beginRound();
    const y1 = new YellowDie(6);
    y1.value = 3;
    p.dice = [y1];
    p.sumScore();

    p.beginRound();
    const y2 = new YellowDie(6);
    y2.value = 5;
    p.dice = [y2];
    p.sumScore();

    expect(p.roundScoreTotals).toEqual([3, 5]);
  });
});

describe('toString()', () => {
  it('includes the player name', () => {
    expect(makePlayer('Bob').toString()).toContain('Bob');
  });
});

describe('sumScore() integration', () => {
  it('calculates all categories correctly in one round', () => {
    const player = new Player('Panda');
    const yellowDice = [new YellowDie(6), new YellowDie(6)];
    const purpleDie = new PurpleDie(6);
    const blueDice = [new BlueDie(6, true), new BlueDie(6)];
    const redDice = [new RedDie(6), new RedDie(6)];
    const greenDie = new GreenDie(20);
    const clearDice = [new ClearDie(6), new ClearDie(6)];
    const pinkDie = new PinkDie(12);

    yellowDice[0]!.value = 2;
    yellowDice[1]!.value = 3;
    purpleDie.value = 4;
    blueDice[0]!.value = 2;
    blueDice[1]!.value = 3;
    redDice[0]!.value = -1;
    redDice[1]!.value = 2;
    greenDie.value = 6;
    clearDice[0]!.value = 4;
    clearDice[1]!.value = 5;
    pinkDie.value = 7;

    player.dice = [...yellowDice, purpleDie, ...blueDice, ...redDice, greenDie, ...clearDice, pinkDie];

    // yellow=5, purple=8, blue=(2+3)*2=10, red=(-1+2)*2=2, green=6, clear=9, pink=7 → 47
    expect(player.sumScore()).toBe(47);
    expect(player.scores[0]).toEqual({
      yellow: 5, purple: 8, blue: 10, red: 2, green: 6, clear: 9, pink: 7, total: 47,
    });
  });

  it('keeps prior round scores intact when starting a new round', () => {
    const player = new Player('Panda');
    player.dice[0]!.value = 4;
    player.sumScore();

    player.beginRound();
    player.dice[0]!.value = 6;
    player.sumScore();

    expect(player.scores).toHaveLength(2);
    expect(player.scores[0]?.yellow).toBe(4);
    expect(player.scores[1]?.yellow).toBe(6);
  });
});
