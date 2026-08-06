import { describe, it, expect } from 'vitest';
import Die from '../../../src/models/core/Die';
import YellowDie from '../../../src/models/dice/YellowDie';

describe('Die', () => {
  it('initializes with null value and the given number of sides', () => {
    const die = new Die(6);
    expect(die.sides).toBe(6);
    expect(die.value).toBeNull();
  });

  it('assigns a unique id on construction', () => {
    const a = new Die(6);
    const b = new Die(6);
    expect(typeof a.id).toBe('string');
    expect(a.id).not.toBe(b.id);
  });

  it('defaults isGlittery to false', () => {
    expect(new Die(6).isGlittery).toBe(false);
  });

  describe('roll()', () => {
    it('sets value between 1 and sides inclusive', () => {
      const die = new Die(6);
      for (let i = 0; i < 200; i++) {
        die.roll();
        expect(die.value).toBeGreaterThanOrEqual(1);
        expect(die.value).toBeLessThanOrEqual(6);
      }
    });

    it('returns the value it set', () => {
      const die = new Die(10);
      const returned = die.roll();
      expect(returned).toBe(die.value);
    });

    it('works for a d20', () => {
      const die = new Die(20);
      for (let i = 0; i < 200; i++) {
        die.roll();
        expect(die.value).toBeGreaterThanOrEqual(1);
        expect(die.value).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('color getter', () => {
    it('returns undefined on the base Die class', () => {
      expect(new Die(6).color).toBeUndefined();
    });

    it('returns the static color of a subclass', () => {
      expect(new YellowDie(6).color).toBe('yellow');
    });
  });
});
