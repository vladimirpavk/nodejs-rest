const express = require('express');
const { body } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.post('/signup', 
    [
        body('email').isEmail(),
        body('password').trim().isLength({ min:5 }),
        body('name').trim().isLength({ min:5 })
    ],
    authController.postSignup
);

module.exports = router;