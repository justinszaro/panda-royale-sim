import { describe, it, expect } from 'vitest';
import GreenGatsby from '../../../src/models/players/GreenGatsby';
import { GreenDie, PurpleDie } from '../../../src/models/dice';

describe('GreenGatsby', () => {
  it('has name "Green Gatsby"', () => {
    expect(new GreenGatsby().name).toBe('Green Gatsby');
  });

  it('prefers GreenDie when choosing', () => {
    const gatsby = new GreenGatsby();
    const green = new GreenDie(20);
    const pool = [new PurpleDie(8), green];
    gatsby.chooseDie(pool);
    expect(gatsby.dice).toContain(green);
  });
});
