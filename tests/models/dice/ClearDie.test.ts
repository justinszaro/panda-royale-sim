import { describe, it, expect } from 'vitest';
import ClearDie from '../../../src/models/dice/ClearDie';

describe('ClearDie', () => {
  it('defaults isTradable to false', () => {
    expect(new ClearDie(6).isTradable).toBe(false);
  });

  it('accepts isTradable=true', () => {
    expect(new ClearDie(6, true).isTradable).toBe(true);
  });

  it('rolls within range', () => {
    const die = new ClearDie(6);
    for (let i = 0; i < 100; i++) {
      die.roll();
      expect(die.value).toBeGreaterThanOrEqual(1);
      expect(die.value).toBeLessThanOrEqual(6);
    }
  });
});
