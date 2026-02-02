import DiceBag from './models/DiceBag';
import { PinkDie } from './models/dice';
import Player from './models/core/Player';

const getPityDice = (numPlayers: number) => {
  let numOfDice;
  if (numPlayers <= 3) numOfDice = 1;
  if (numPlayers <= 6) numOfDice = 2;
  if (numPlayers <= 9) numOfDice = 3;
  if (numPlayers <= 10) numOfDice = 4;

  return new Array(numOfDice).fill(null).map(() => new PinkDie(12));
}

const playGame = () => {
  const diceBag = new DiceBag();
  const players = [new Player('Justin'), new Player('Taryn')];
  const pityDice: Die[] = getPityDice(players.length);

  for (let round = 1; round <= 10; round++) {
    console.log(`--- Round ${round} ---`);
    players.forEach((player, index) => {
      player.rollDice()

      console.log(`${player.name} rolled a score of ${player.roundScore}`);
    });

    const scores = players.sort((a, b) => a.roundScore - b.roundScore);

    console.log(scores);
  }

}

// For 10 rounds,
// players roll dice.
// Sum up scores.
// Give the highest roundScore player a panda token.
// Give the lowest roundScore player a pity dice.

playGame();
