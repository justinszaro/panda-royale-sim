import { describe, it, expect } from 'vitest';
import PurplePepper from '../../../src/models/players/PurplePepper';
import { BlueDie, PurpleDie } from '../../../src/models/dice';

describe('PurplePepper', () => {
  it('has name "Purple Pepper"', () => {
    expect(new PurplePepper().name).toBe('Purple Pepper');
  });

  it('prefers PurpleDie when choosing', () => {
    const pepper = new PurplePepper();
    const purple = new PurpleDie(8);
    const pool = [new BlueDie(6), purple];
    pepper.chooseDie(pool);
    expect(pepper.dice).toContain(purple);
  });
});
