import DiceBag from './models/DiceBag';
import Player from './models/core/Player';
import {
  determineWinner,
  getPityDice
} from './utils';


const playGame = () => {
  const diceBag = new DiceBag();
  const players = [new Player('Justin'), new Player('Taryn')];
  const pityDice: Die[] = getPityDice(players.length);

  for (let round = 1; round <= 10; round++) {
    console.log(`--- Round ${round} ---`);
    players.forEach((player, index) => {
      player.rollDice()
      const roundScore = player.sumScore();

      console.log(`${player.name} rolled a score of ${roundScore}`);
    });

    const scores = players.sort((a, b) => b.roundScore - a.roundScore);

    // TODO: Someone gets a panda token.
    // TODO: Lowest score gets the pity dice.
    let diceForGrabs = diceBag.drawRandomDice(players.length + 1);
    players.forEach((player, index) => {
      const result = player.chooseDie(diceForGrabs);
      if (result) {
        diceForGrabs = result;
      }
    });

    diceBag.returnDice(diceForGrabs);
  }

  const winner = determineWinner(players);

  if (winner) {
    console.log(`The winner is ${winner.name} with a total score of ${winner.scores.reduce((acc, score) => acc + score, 0)}!`);
  }
}

// For 10 rounds,
// players roll dice.
// Sum up scores.
// Give the highest roundScore player a panda token.
// Give the lowest roundScore player a pity dice.

playGame();
