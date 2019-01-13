const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');
const userModel = require('../models/user');

exports.postSignup = (req, res, next)=>{
    console.log('POST /auth/signup hitted');
    console.log(req.body['email'], req.body['password'], req.body['name'], req.body['status']);

    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        //there are some server side validation errors
        const error = new Error(JSON.stringify(errors.array()));
        error.statusCode = 422; //Unprocessable Entity
        throw error;
    }

    const email = req.body['email'];
    const password = req.body['password'];
    const name = req.body['name'];
    const status = req.body['status'];

    userModel.findOne(
        {
            email: email
        }
    ).then(
        (result)=>{            
            if(result !== null){
                const error = new Error("Username already exists...");
                error.statusCode = 422; //Unprocessable Entity
                return next(error);               
            }
            //username does not exists
            bcrypt.hash(password, 12).then(
                (encryptedPassword)=>{
                    const user = new userModel();
                    user.email = email;
                    user.name = name;
                    user.password = encryptedPassword;
                    user.status = status;
                    user.save().then(
                        (result)=>{
                            return res.status(200).json({
                                message:'User successfully created...'
                            });
                        }                        
                    )
                    .catch(
                        (err)=>{                             
                            const error = new Error(err);
                            error.statusCode = 422; //Unprocessable Entity
                            return next(error); 
                        }
                    )                
                }
            )
            .catch(
                (err)=>{
                    const error=new Error('Server error. Woking on fixing the problem');
                    error.statusCode = 500;
                    return next(error);
                }
            )
        }
    )
}

exports.postLogin = (req, res, next)=>{
    console.log('POST /auth/login hitted');
    console.log(req.body['email'], req.body['password']);

    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        //there are some server side validation errors
        const error = new Error(JSON.stringify(errors.array()));
        error.statusCode = 422; //Unprocessable Entity
        throw error;
    }

    const email = req.body['email'];
    const password = req.body['password'];

    userModel.findOne({
        email: email
    }).then(
        (result)=>{           
            if(result === null)
            {
                //username not found
                const error = new Error('Username not found...');
                error.statusCode = 422;
                return next(error);
            }
            //username found - compare password
            bcrypt.compare(password, result.password).then(
                (isSame)=>{
                    if(isSame){
                        //passwords match
                        //change logic here - this is demo purposes only
                        return res.status(200).json({
                            message: 'user logged in'
                        });
                    }
                    //passwords do not match - throw error
                    const error = new Error('Password invalid...');
                    error.statusCode = 422;
                    return next(error);
                }
            )
            .catch(
                (err)=>{
                    const error=new Error('Server error. Woking on fixing the problem');
                    error.statusCode = 500;
                    return next(error);
                }
            )
        }
    )
    .catch(
        (err)=>{
            const error = new Error('Username not found...');
            error.statusCode = 422;
            return next(error);
        }
    )
}