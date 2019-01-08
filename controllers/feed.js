const { validationResult } = require('express-validator/check');
const postModel = require('../models/post');

exports.getPosts = (req, res, next)=>{    
    res.status(200).json({
        posts: [
            {
                _id:1,
                title: 'My new assigment',
                content: 'Story about my new assigment',
                imageUrl: 'images/pavle.jpg',
                creator:{
                    name: 'Pavle'
                },
                date:new Date().now
            }
        ]
    });
}

exports.createPost = (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            message: 'Validation failed...',
            errors: errors.array()
        });
    }

    const title = req.body.title;
    const content = req.body.content;
    
    res.status(201).json({
        'message': 'Post created successfully!',
        post: {
            _id: new Date().now,
            title: title,
            content: content,
            creator: {
                name: 'Pavle'
            },
            createdAt: new Date()
        }
    });
}