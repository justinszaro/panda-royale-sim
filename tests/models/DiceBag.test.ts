import { describe, it, expect } from 'vitest';
import DiceBag from '../../src/models/DiceBag';
import { BlueDie, ClearDie, GreenDie, PurpleDie, RedDie, YellowDie } from '../../src/models/dice';

const TOTAL_DICE = 92; // 7+10+10+9+9+7+7+7+10+9+7

describe('DiceBag constructor', () => {
  it('creates the correct total number of dice', () => {
    expect(new DiceBag().dice).toHaveLength(TOTAL_DICE);
  });

  it('contains the correct count of each die type', () => {
    const bag = new DiceBag();
    expect(bag.dice.filter((d) => d instanceof YellowDie)).toHaveLength(7);
    expect(bag.dice.filter((d) => d instanceof GreenDie)).toHaveLength(10);
    expect(bag.dice.filter((d) => d instanceof BlueDie)).toHaveLength(35);
    expect(bag.dice.filter((d) => d instanceof PurpleDie)).toHaveLength(14);
    expect(bag.dice.filter((d) => d instanceof RedDie)).toHaveLength(19);
    expect(bag.dice.filter((d) => d instanceof ClearDie)).toHaveLength(7);
  });

  it('includes yellow dice with 8 sides', () => {
    const yellows = new DiceBag().dice.filter((d) => d instanceof YellowDie);
    expect(yellows.every((d) => d.sides === 8)).toBe(true);
  });

  it('includes green dice with 20 sides', () => {
    const greens = new DiceBag().dice.filter((d) => d instanceof GreenDie);
    expect(greens.every((d) => d.sides === 20)).toBe(true);
  });

  it('has 7 glittery and 28 non-glittery blue dice', () => {
    const blues = new DiceBag().dice.filter((d) => d instanceof BlueDie) as BlueDie[];
    expect(blues.filter((d) => d.isGlittery)).toHaveLength(7);
    expect(blues.filter((d) => !d.isGlittery)).toHaveLength(28);
  });

  it('initializes all clear dice with isTradable=false', () => {
    const clears = new DiceBag().dice.filter((d) => d instanceof ClearDie) as ClearDie[];
    expect(clears.every((d) => !d.isTradable)).toBe(true);
  });

  it('assigns unique ids to every die', () => {
    const ids = new DiceBag().dice.map((d) => d.id);
    expect(new Set(ids).size).toBe(TOTAL_DICE);
  });
});

describe('drawRandomDice()', () => {
  it('returns the requested number of dice', () => {
    expect(new DiceBag().drawRandomDice(5)).toHaveLength(5);
  });

  it('removes drawn dice from the bag', () => {
    const bag = new DiceBag();
    bag.drawRandomDice(10);
    expect(bag.dice).toHaveLength(TOTAL_DICE - 10);
  });

  it('returns at most the remaining dice when asked for more than available', () => {
    const bag = new DiceBag();
    expect(bag.drawRandomDice(TOTAL_DICE + 100)).toHaveLength(TOTAL_DICE);
    expect(bag.dice).toHaveLength(0);
  });

  it('returns an empty array from an empty bag', () => {
    const bag = new DiceBag();
    bag.drawRandomDice(TOTAL_DICE);
    expect(bag.drawRandomDice(5)).toHaveLength(0);
  });

  it('does not return duplicate die instances', () => {
    const bag = new DiceBag();
    const drawn = bag.drawRandomDice(20);
    const ids = drawn.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('returnDice()', () => {
  it('adds dice back into the bag', () => {
    const bag = new DiceBag();
    const drawn = bag.drawRandomDice(10);
    bag.returnDice(drawn);
    expect(bag.dice).toHaveLength(TOTAL_DICE);
  });

  it('accepts an empty array without error', () => {
    const bag = new DiceBag();
    expect(() => bag.returnDice([])).not.toThrow();
    expect(bag.dice).toHaveLength(TOTAL_DICE);
  });
});
