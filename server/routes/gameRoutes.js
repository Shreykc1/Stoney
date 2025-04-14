const express = require('express');
const router = express.Router();
const { createGame, joinGame } = require('../controllers/gameController');

router.post('/create', createGame);
router.post('/join', joinGame);

module.exports = router;
