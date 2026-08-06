import { describe, it, expect } from 'vitest';
import PinkDie from '../../../src/models/dice/PinkDie';

describe('PinkDie', () => {
  it('has color "pink"', () => {
    expect(new PinkDie(12).color).toBe('pink');
  });

  it('rolls within range', () => {
    const die = new PinkDie(12);
    for (let i = 0; i < 100; i++) {
      die.roll();
      expect(die.value).toBeGreaterThanOrEqual(1);
      expect(die.value).toBeLessThanOrEqual(12);
    }
  });
});
