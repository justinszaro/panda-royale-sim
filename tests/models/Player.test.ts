import { describe, expect, test } from "vitest";
import Player from "../../src/models/core/Player";
import {
  BlueDie,
  ClearDie,
  GreenDie,
  PinkDie,
  PurpleDie,
  RedDie,
  YellowDie,
} from "../../src/models/dice";

describe("Player scoring", () => {
  test("records each dice category and the round total", () => {
    const player = new Player("Panda");
    const yellowDice = [new YellowDie(6), new YellowDie(6)];
    const purpleDie = new PurpleDie(6);
    const blueDice = [new BlueDie(6, true), new BlueDie(6)];
    const redDice = [new RedDie(6), new RedDie(6)];
    const greenDie = new GreenDie(6);
    const clearDice = [new ClearDie(6), new ClearDie(6)];
    const pinkDie = new PinkDie(12);

    yellowDice[0].value = 2;
    yellowDice[1].value = 3;
    purpleDie.value = 4;
    blueDice[0].value = 2;
    blueDice[1].value = 3;
    redDice[0].value = -1;
    redDice[1].value = 2;
    greenDie.value = 6;
    clearDice[0].value = 4;
    clearDice[1].value = 5;
    pinkDie.value = 7;
    player.dice = [
      ...yellowDice,
      purpleDie,
      ...blueDice,
      ...redDice,
      greenDie,
      ...clearDice,
      pinkDie,
    ];

    expect(player.sumScore()).toBe(47);
    expect(player.scores).toEqual([
      {
        yellow: 5,
        purple: 8,
        blue: 10,
        red: 2,
        green: 6,
        clear: 9,
        pink: 7,
        total: 47,
      },
    ]);
  });

  test("starts a new score object without changing previous rounds", () => {
    const player = new Player("Panda");
    player.dice[0].value = 4;

    player.sumScore();
    player.beginRound();
    player.dice[0].value = 6;
    player.sumScore();

    expect(player.scores).toHaveLength(2);
    expect(player.scores[0]?.yellow).toBe(4);
    expect(player.scores[0]?.total).toBe(4);
    expect(player.scores[1]?.yellow).toBe(6);
    expect(player.scores[1]?.total).toBe(6);
  });
});
