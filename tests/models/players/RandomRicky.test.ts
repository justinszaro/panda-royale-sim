import { describe, it, expect, vi, afterEach } from 'vitest';
import RandomRicky from '../../../src/models/players/RandomRicky';
import { BlueDie, PurpleDie } from '../../../src/models/dice';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('RandomRicky', () => {
  it('has name "Random Ricky"', () => {
    expect(new RandomRicky().name).toBe('Random Ricky');
  });

  it('isHuman is false', () => {
    expect(new RandomRicky().isHuman).toBe(false);
  });

  it('picks randomly with no preference', () => {
    const ricky = new RandomRicky();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const blue = new BlueDie(6);
    const pool = [blue, new PurpleDie(8)];
    ricky.chooseDie(pool);
    expect(ricky.dice).toContain(blue);
  });
});
