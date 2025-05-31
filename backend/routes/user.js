const express = require('express');
const { registerUser, loginUser, getUserDetails, updateUserDetails, updateUserPassword } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user/:id', getUserDetails);
router.put('/user/:id', updateUserDetails);
router.put('/user/:id/password', updateUserPassword);

module.exports = router;