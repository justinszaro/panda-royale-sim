import { describe, it, expect, vi, afterEach } from 'vitest';
import { SpecialtyPlayer } from '../../../src/models/players/SpecialtyPlayer';
import Player from '../../../src/models/core/Player';
import { BlueDie, ClearDie, PurpleDie, YellowDie } from '../../../src/models/dice';

afterEach(() => {
  vi.restoreAllMocks();
});

class BlueSpecialist extends SpecialtyPlayer {
  constructor() {
    super('Blue Specialist', BlueDie);
  }
}

describe('SpecialtyPlayer.chooseDie()', () => {
  it('picks its favorite die type when available', () => {
    const p = new BlueSpecialist();
    const blue = new BlueDie(6);
    const purple = new PurpleDie(8);
    const pool = [purple, blue];

    p.chooseDie(pool);

    expect(p.dice).toContain(blue);
    expect(pool).not.toContain(blue);
  });

  it('falls back to random pick when no favorite in pool', () => {
    const p = new BlueSpecialist();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const purple = new PurpleDie(8);
    const pool = [purple];

    p.chooseDie(pool);

    expect(p.dice).toContain(purple);
  });

  it('picks yellow before favorite when shouldSeekYellow=true', () => {
    const p = new BlueSpecialist();
    p.shouldSeekYellow = true;
    const yellow = new YellowDie(6);
    const blue = new BlueDie(6);
    const pool = [blue, yellow];

    p.chooseDie(pool);

    expect(p.dice).toContain(yellow);
    expect(p.dice).not.toContain(blue);
  });

  it('returns undefined for an empty pool', () => {
    expect(new BlueSpecialist().chooseDie([])).toBeUndefined();
  });
});

describe('SpecialtyPlayer.tradeDie()', () => {
  it('targets an opponent who has the favorite die', () => {
    const p = new BlueSpecialist();
    const clearDie = new ClearDie(6, false);
    p.dice = [clearDie];

    const opponent = new Player('opponent');
    const blueDie = new BlueDie(6);
    opponent.dice = [blueDie];

    const bystander = new Player('bystander');
    bystander.dice = [new PurpleDie(8)];

    vi.spyOn(Math, 'random').mockReturnValue(0);
    p.tradeDie([opponent, bystander]);

    expect(p.dice).toContain(blueDie);
    expect(opponent.dice).toContain(clearDie);
  });

  it('falls back to base tradeDie when no opponent has the favorite', () => {
    const p = new BlueSpecialist();
    const clearDie = new ClearDie(6, false);
    const opponentDie = new PurpleDie(8);
    p.dice = [clearDie];

    const opponent = new Player('opponent');
    opponent.dice = [opponentDie];

    vi.spyOn(Math, 'random').mockReturnValue(0);
    p.tradeDie([opponent]);

    // Falls back to base: should trade the clear die for any non-clear die
    expect(p.dice).toContain(opponentDie);
    expect(opponent.dice).toContain(clearDie);
  });

  it('does nothing when the player has no clear dice', () => {
    const p = new BlueSpecialist();
    const initialDice = [...p.dice];
    p.tradeDie([new Player('opponent')]);
    expect(p.dice).toEqual(initialDice);
  });
});
