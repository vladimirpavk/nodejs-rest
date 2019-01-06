const express = require('express');

const feedController = require('../controllers/feed');

const router = express.Router();

//add router implementation here
router.get('/posts', feedController.getPosts);
router.post('/post', feedController.createPost);

module.exports = router;