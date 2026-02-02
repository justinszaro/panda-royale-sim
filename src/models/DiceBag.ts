import {
  BlueDie,
  ClearDie,
  GreenDie,
  PinkDie,
  PurpleDie,
  RedDie,
  YellowDie,
} from './dice';

export default class DiceBag {
  public dice: Die[] = [];

  constructor() {
    const dieConfigs = [
      { DieClass: YellowDie, count: 7, sides: 8 },

      { DieClass: GreenDie, count: 10, sides: 20 },

      { DieClass: BlueDie, count: 10, sides: 6, isGlittery: false },
      { DieClass: BlueDie, count: 9, sides: 8, isGlittery: false },
      { DieClass: BlueDie, count: 9, sides: 12, isGlittery: false },
      { DieClass: BlueDie, count: 7, sides: 6, isGlittery: true },

      { DieClass: PurpleDie, count: 7, sides: 8 },
      { DieClass: PurpleDie, count: 7, sides: 12 },

      { DieClass: RedDie, count: 10, sides: 6 },
      { DieClass: RedDie, count: 9, sides: 8 },

      { DieClass: ClearDie, count: 7, sides: 6, isTradable: false },
    ];
    for (const { DieClass, count, sides, ...config } of dieConfigs) {
      for (let i = 0; i < count; i++) {
        if (DieClass === BlueDie) {
          this.dice.push(new BlueDie(sides, config.isGlittery ?? false));
        } else if (DieClass === ClearDie) {
          this.dice.push(new ClearDie(sides, config.isTradable ?? false));
        } else {
          this.dice.push(new DieClass(sides));
        }
      }
    }
  }
}
