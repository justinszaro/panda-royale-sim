import { describe, it, expect } from 'vitest';
import YellowDie from '../../../src/models/dice/YellowDie';

describe('YellowDie', () => {
  it('has color "yellow"', () => {
    expect(new YellowDie(6).color).toBe('yellow');
  });

  it('rolls within range', () => {
    const die = new YellowDie(6);
    for (let i = 0; i < 100; i++) {
      die.roll();
      expect(die.value).toBeGreaterThanOrEqual(1);
      expect(die.value).toBeLessThanOrEqual(6);
    }
  });
});
