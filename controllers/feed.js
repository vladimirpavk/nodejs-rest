const { validationResult } = require('express-validator/check');
const postModel = require('../models/post');

exports.getPosts = (req, res, next)=>{
    postModel.find().then(
        (posts)=>{
            res.status(200).json({
                message: 'Posts fetched successfully...',
                posts: posts
            });
        }
    )
    .catch(
        (err)=>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        }
    );
    
    /*res.status(200).json({
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
    });*/
}

exports.createPost = (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){      
        const error = new Error('SSV failed...');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const post = new postModel({
        title: title,
        imageUrl: 'images/pizza-pavliana.jpg',
        content: content,
        creator: {
            name: 'Pavle'
        }
    });

    post.save()
        .then((result)=>{
            res.status(201).json({
                'message': 'Post created successfully!',
                post: result
            });
        })
        .catch(
            (err)=>{ 
                if(!err.statusCode) err.statusCode = 500;
                next(err);
            });       
}

exports.getPost = (req, res, next)=>{
    const postId = req.params['postId'];
    postModel.findById(postId)
        .then(
            (result)=>{                
                if(!result){
                    const error = new Error('Could not find post...');
                    error.statusCode = 404;
                    throw error;
                }

                res.status(200).json({
                    message: 'Post fetched...',
                    post: result
                });
            }
        )
    .catch(
        (err)=>{ 
            if(!err.statusCode) err.statusCode = 500;
            next(err);
    }); 
}