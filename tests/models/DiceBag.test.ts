import { expect, describe, test, beforeAll } from 'vitest'
import DiceBag from '../../src/models/DiceBag';

describe('DiceBag', () => {
  let diceBag;

  beforeAll(() => {
    diceBag = new DiceBag();
  })

  test('Should contain the correct total number of dice', () => {
    expect(diceBag.dice.length).toBe(92);
  })

  test('Should contain the correct number of each die type', () => {
    const dieCounts: { [key: string]: number } = {};

    for (const die of diceBag.dice) {
      const dieName = die.constructor.name;
      dieCounts[dieName] = (dieCounts[dieName] || 0) + 1;
    }

    expect(dieCounts['YellowDie']).toBe(7);
    expect(dieCounts['GreenDie']).toBe(10);
    expect(dieCounts['BlueDie']).toBe(35);
    expect(dieCounts['PurpleDie']).toBe(14);
    expect(dieCounts['RedDie']).toBe(19);
    expect(dieCounts['ClearDie']).toBe(7);
  })

  test('Should correctly set properties for BlueDie and ClearDie', () => {
    const blueDies = diceBag.dice.filter(die => die.constructor.name === 'BlueDie') as any[];
    const clearDies = diceBag.dice.filter(die => die.constructor.name === 'ClearDie') as any[];

    const glitteryBlueDies = blueDies.filter(die => die.isGlittery);
    const nonGlitteryBlueDies = blueDies.filter(die => !die.isGlittery);

    expect(glitteryBlueDies.length).toBe(7);
    expect(nonGlitteryBlueDies.length).toBe(28); // 10 + 9 + 9

    for (const clearDie of clearDies) {
      expect(clearDie.isTradable).toBe(false);
    }
  })
})
