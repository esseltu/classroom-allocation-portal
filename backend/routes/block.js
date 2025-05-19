const express = require('express');
const { getBlocks, addBlock } = require('../controllers/blockController');

const router = express.Router();

router.get('/block', getBlocks); // Route to get all blocks
router.post('/block', addBlock); // Route to add a new block

module.exports = router;