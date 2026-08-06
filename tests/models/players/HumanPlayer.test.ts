import { describe, it, expect } from 'vitest';
import HumanPlayer from '../../../src/models/players/HumanPlayer';
import { BlueDie } from '../../../src/models/dice';

describe('HumanPlayer', () => {
  it('has isHuman=true', () => {
    expect(new HumanPlayer().isHuman).toBe(true);
  });

  it('throws when chooseDie() is called directly', () => {
    const human = new HumanPlayer();
    expect(() => human.chooseDie([new BlueDie(6)])).toThrow();
  });
});
