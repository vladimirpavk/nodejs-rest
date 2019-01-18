const express = require('express');
const { body } = require('express-validator/check');
const isAuth = require('../middleware/is-auth');

const feedController = require('../controllers/feed');

const router = express.Router();

//add router implementation here
router.get('/posts', isAuth, feedController.getPosts);
router.get('/post/:postId', isAuth, feedController.getPost);

router.post('/post', isAuth,
    [
        body('title').trim().isLength({ min:7 }),
        body('content').trim().isLength({ min:5 })
    ],
    feedController.createPost
);

router.put('/post/:postId', isAuth, 
[
    body('title').trim().isLength({ min:7 }),
    body('content').trim().isLength({ min:5 })
], feedController.updatePost);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;