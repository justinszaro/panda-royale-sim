import { describe, it, expect, vi, afterEach } from 'vitest';
import RedDie from '../../../src/models/dice/RedDie';

describe('RedDie', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has color "red"', () => {
    expect(new RedDie(6).color).toBe('red');
  });

  it('returns a negative value when the raw roll is in the lower half', () => {
    // Math.random() = 0 → raw roll = 1 → 1 <= 6/2 → negated to -1
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const die = new RedDie(6);
    expect(die.roll()).toBe(-1);
    expect(die.value).toBe(-1);
  });

  it('returns a positive value when the raw roll is in the upper half', () => {
    // Math.random() close to 1 → raw roll = 6 → 6 > 6/2 → stays 6
    vi.spyOn(Math, 'random').mockReturnValue(5 / 6);
    const die = new RedDie(6);
    expect(die.roll()).toBe(6);
    expect(die.value).toBe(6);
  });

  it('boundary: roll exactly at sides/2 is negated', () => {
    // Math.random() = 2/6 → raw = 3 → 3 <= 3 → negated
    vi.spyOn(Math, 'random').mockReturnValue(2 / 6);
    const die = new RedDie(6);
    expect(die.roll()).toBe(-3);
  });

  it('boundary: roll at sides/2 + 1 stays positive', () => {
    // Math.random() = 3/6 → raw = 4 → 4 > 3 → stays positive
    vi.spyOn(Math, 'random').mockReturnValue(3 / 6);
    const die = new RedDie(6);
    expect(die.roll()).toBe(4);
  });

  it('produces both positive and negative values across many rolls', () => {
    const die = new RedDie(6);
    const values = new Set<number>();
    for (let i = 0; i < 500; i++) values.add(Math.sign(die.roll()));
    expect(values.has(-1)).toBe(true);
    expect(values.has(1)).toBe(true);
  });
});
