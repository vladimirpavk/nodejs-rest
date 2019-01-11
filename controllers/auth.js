const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');
const userModel = require('../models/user');

exports.postSignup = (req, res, next)=>{
    console.log('POST /auth/signup hitted');
    console.log(req.body['email'], req.body['password'], req.body['name']);

    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        //there are some server side validation errors
        const error = new Error('Server side validation error');
        error.statusCode = 422; //Unprocessable Entity
        throw error;
    }

    const email = req.body['email'];
    const password = req.body['password'];
    const name = req.body['name'];

    userModel.findOne(
        {
            email: email
        }
    ).then(
        (result)=>{
            console.log(result);
            if(result !== null){
                return res.status(422).json({
                    message: 'Username already exists...'
                });                
            }
            //username does not exists
            bcrypt.hash(password, 12).then(
                (encryptedPassword)=>{
                    const user = new userModel();
                    user.email = email;
                    user.name = name;
                    user.password = encryptedPassword;
                    user.save();
                    return res.status(200).json({
                        message:'User successfully created...'
                    });
                }
            )
            .catch(
                (err)=>{
                    const error=new Error('Server side validation error');
                    error.statusCode = 500;
                    throw error;
                }
            )
        }
    )
}