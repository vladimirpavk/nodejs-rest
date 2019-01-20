const { validationResult } = require('express-validator/check');
const mongoose = require('mongoose');

const postModel = require('../models/post');
const userModel = require('../models/user');

exports.getPosts = async (req, res, next)=>{
    try{
        const posts = await postModel.find();
        return res.status(200).json({
            message: 'Posts fetched successfully...',
            posts: posts
        });
    }
    catch(err){
        if(!err.statusCode) err.statusCode = 500;                
        next(err);
    }
}

exports.createPost = async (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){      
        const error = new Error('SSV failed...');
        error.statusCode = 422;
        throw error;
    }
    if(!req.file){
        const  error = new Error('File not provided...');
        error.statusCode = 404;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace("\\" ,"/");
    const post = new postModel({
        title: title,
        imageUrl: imageUrl,
        content: content,
        creator: req.userId             
    });

    try{
        let newPost = await post.save();
        const foundUser = await userModel.findById(req.userId);
        foundUser.posts.push(post);
        const result = await foundUser.save();

        return res.status(201).json({
            message: 'Post created successfully!',
            post: newPost,
            creator: { _id: result._id, name: result.name }
        });
    }
    catch(err){
        if(!err.statusCode) err.statusCode = 500;
        next(err);
    }    
    /*post.save()
        .then((post)=>{
            newPost = post;
            return userModel.findById(req.userId) 
        })
        .then((foundUser)=>{
            foundUser.posts.push(post);
            return foundUser.save();
        })
        .then((result)=>{
            return res.status(201).json({
                'message': 'Post created successfully!',
                post: newPost,
                creator: { _id: result._id, name: result.name }
            });
        })                   
        .catch(
            (err)=>{ 
                if(!err.statusCode) err.statusCode = 500;
                next(err);
            });*/       
}

exports.getPost = async (req, res, next)=>{
    const postId = req.params['postId'];
    try{
        const result = await postModel.findById(postId);
        if(!result){
            const error = new Error('Could not find post...');
            error.statusCode = 404;
            next(error);
        }               
        return res.status(200).json({
            message: 'Post fetched...',
            post: result
        });
    }
    catch(err){
        if(!err.statusCode) err.statusCode = 500;
        next(err);
    }
    
    /*postModel.findById(postId)
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
    });*/
}

exports.updatePost = async (req, res, next)=>{
    const postId = req.params['postId'];
    const errors = validationResult(req);
    if(!errors.isEmpty()){      
        const error = new Error('SSV failed...');
        error.statusCode = 422;
        throw error;
    }
    if(!req.file){
        const  error = new Error('File not provided...');
        error.statusCode = 404;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace("\\" ,"/");
    
    const updatedPost = {
        title: title,
        imageUrl: imageUrl,
        content: content,
        creator: {
            name: req.userId
        }
    };
    console.log(updatedPost);

    try{
        const isOk = await postModel.findOneAndUpdate(
            {
                _id: postId
            }, updatedPost);
        return res.status(200).json({            
            message: 'Post updated',
            post: updatedPost});  
    }
    catch(err){
        if(!err.statusCode) err.statusCode = 500;
        next(err);
    }

    
    /*postModel.findOneAndUpdate(
        {
            _id: postId
        }, updatedPost)
        .then(
            (ok)=>{
                res.status(200).json({
                    message: 'Post updated',
                    post: updatedPost});                   
            })
        .catch(
            (err)=>{
               const error = new Error('Something bad happened...');
               error.statusCode = 500;
               next(error);
            }
    );*/
}

exports.deletePost = async (req, res, next)=>{
    const postId = req.params['postId'];
    try{
        const result = await postModel.findOneAndDelete(
            {
                _id: postId
            });
        return res.status(200).json(
            {
                message: 'Post deleted successfully...'
            }
        );
    }
    catch(err){
        if(!err.statusCode) err.statusCode = 500;
        next(err);
    }

    /*postModel.findOneAndDelete(
        {
            _id: postId
        }
    ).then(
        (result)=>{
            res.status(200).json(
                {
                    message: 'Post deleted successfully...'
                }
            );
        }
    )
    .catch(
        (err)=>{
            const error = new Error('Something bad happened...');
            error.statusCode = 500;
            next(error);
        }
    )*/
}