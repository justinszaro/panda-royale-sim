import { describe, it, expect } from 'vitest';
import BlueDie from '../../../src/models/dice/BlueDie';

describe('BlueDie', () => {
  it('has color "blue"', () => {
    expect(new BlueDie(6).color).toBe('blue');
  });

  it('defaults isGlittery to false', () => {
    expect(new BlueDie(6).isGlittery).toBe(false);
  });

  it('accepts isGlittery=true', () => {
    expect(new BlueDie(6, true).isGlittery).toBe(true);
  });

  it('rolls within range', () => {
    const die = new BlueDie(8);
    for (let i = 0; i < 100; i++) {
      die.roll();
      expect(die.value).toBeGreaterThanOrEqual(1);
      expect(die.value).toBeLessThanOrEqual(8);
    }
  });
});
