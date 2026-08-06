import { describe, it, expect } from 'vitest';
import GreenDie from '../../../src/models/dice/GreenDie';

describe('GreenDie', () => {
  it('has color "green"', () => {
    expect(new GreenDie(20).color).toBe('green');
  });

  it('rolls within range', () => {
    const die = new GreenDie(20);
    for (let i = 0; i < 100; i++) {
      die.roll();
      expect(die.value).toBeGreaterThanOrEqual(1);
      expect(die.value).toBeLessThanOrEqual(20);
    }
  });
});
