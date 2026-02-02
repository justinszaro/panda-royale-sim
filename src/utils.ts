import { PinkDie } from './models/dice';
import Player from './models/core/Player';

export const getPityDice = (numPlayers: number) => {
  let numOfDice;
  if (numPlayers <= 3) numOfDice = 1;
  if (numPlayers <= 6) numOfDice = 2;
  if (numPlayers <= 9) numOfDice = 3;
  if (numPlayers <= 10) numOfDice = 4;

  return new Array(numOfDice).fill(null).map(() => new PinkDie(12));
}

export const determineWinner = (players: Player[]) => {
  const sortedPlayers = players.sort((a, b) => b.scores.reduce((acc, score) => acc + score, 0) - a.scores.reduce((acc, score) => acc + score, 0));
  return sortedPlayers[0];
}
