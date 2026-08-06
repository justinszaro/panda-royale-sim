import { describe, it, expect } from 'vitest';
import BlueBen from '../../../src/models/players/BlueBen';
import { BlueDie, PurpleDie } from '../../../src/models/dice';

describe('BlueBen', () => {
  it('has name "Blue Ben"', () => {
    expect(new BlueBen().name).toBe('Blue Ben');
  });

  it('prefers BlueDie when choosing', () => {
    const ben = new BlueBen();
    const blue = new BlueDie(6);
    const pool = [new PurpleDie(8), blue];
    ben.chooseDie(pool);
    expect(ben.dice).toContain(blue);
  });
});
