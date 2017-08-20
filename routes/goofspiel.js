const initGoofData = require('../helpers/initGoofDatabase');
const express = require('express');
const router  = express.Router();

global.goofObj = {};
global.usersGamesObj = {};
module.exports = (knex) => {
  router.get('/:id', (req, res) => {
    res.send(global.goofObj[req.params.id]);
  });

  router.post('/:id', (req, res) => {
    const id = req.params.id;
    const user_id = req.cookies.user_id;
    const userKey = `p${user_id}Games`;
    
    initGoofData(global.goofObj[id], req.body.player1, req.body.player2);
    
    if (global.usersGamesObj[userKey] === undefined) {
      global.usersGamesObj[userKey] = [];
    }
    global.usersGamesObj[userKey] &&
    typeof global.usersGamesObj[userKey] === 'array' &&
    global.usersGamesObj[userKey].includes(id) ? null : global.usersGamesObj[userKey].append(id);

    res.sendStatus(201);
  });

  router.post('/:id/nextturn', (req, res) => {
    const currObj = global.goofObj[req.params.id];
    if (currObj) {
      if (req.body.username === currObj.player1) {
        currObj.p1LastPlayed = req.body.played;
        currObj.p1Sent = true;
        let index = currObj.p1Hand.indexOf(parseInt(req.body.played, 10));
        currObj.p1Hand.splice(index, 1);
      } else if (req.body.username === currObj.player2) {
        currObj.p2LastPlayed = req.body.played;
        currObj.p2Sent = true;
        let index = currObj.p2Hand.indexOf(parseInt(req.body.played, 10));
        currObj.p2Hand.splice(index, 1);
      }

      if (currObj.p2Sent && currObj.p1Sent) {
        if (currObj.p1LastPlayed > currObj.p2LastPlayed) {
          currObj.p1Won.push(currObj.prizes.shift());
        } else if (currObj.p1LastPlayed < currObj.p2LastPlayed) {
          currObj.p2Won.push(currObj.prizes.shift());
        } else {
          currObj.prizes.shift();
        }
        currObj.p1Sent = false;
        currObj.p2Sent = false;

        if (currObj.prizes.length === 0) {
          console.log('gameover!');
          res.send('gameover!');
        }
      }

      res.sendStatus(201);
    } else {
      res.status(403).send('no game by that id yet exists');
    }
  });
  
  router.get('/users/:id/games', function (req, res) {
    console.log('$$$$$$$$$$$', global.usersGamesObj)
    res.send({games: global.usersGamesObj[req.params.id]});
  });
  return router;
};
