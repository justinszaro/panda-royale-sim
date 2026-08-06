import { describe, it, expect } from 'vitest';
import PurpleDie from '../../../src/models/dice/PurpleDie';

describe('PurpleDie', () => {
  it('has color "purple"', () => {
    expect(new PurpleDie(8).color).toBe('purple');
  });

  it('rolls within range', () => {
    const die = new PurpleDie(8);
    for (let i = 0; i < 100; i++) {
      die.roll();
      expect(die.value).toBeGreaterThanOrEqual(1);
      expect(die.value).toBeLessThanOrEqual(8);
    }
  });
});
