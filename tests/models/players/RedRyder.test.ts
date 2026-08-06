import { describe, it, expect } from 'vitest';
import RedRyder from '../../../src/models/players/RedRyder';
import { BlueDie, RedDie } from '../../../src/models/dice';

describe('RedRyder', () => {
  it('has name "Red Ryder"', () => {
    expect(new RedRyder().name).toBe('Red Ryder');
  });

  it('prefers RedDie when choosing', () => {
    const ryder = new RedRyder();
    const red = new RedDie(6);
    const pool = [new BlueDie(6), red];
    ryder.chooseDie(pool);
    expect(ryder.dice).toContain(red);
  });
});
