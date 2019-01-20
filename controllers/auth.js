const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator/check');
const mongoose = require('mongoose');

const appConfig = require('../app-config');
const userModel = require('../models/user');

/*const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(appConfig.sendGridApi);*/

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {        
        api_key: appConfig.sendGridApiKey
    }
}));

exports.postSignup = async (req, res, next)=>{
    console.log('POST /auth/signup hitted');
    console.log(req.body['email'], req.body['password'], req.body['name']);

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

    try{
        const result = await userModel.findOne(
            {
                email: email
            }
        );
        if(result !== null){
            const error = new Error("Username already exists...");
            error.statusCode = 422; //Unprocessable Entity
            return next(error);               
        }
        const encryptedPassword = await bcrypt.hash(password, 12);

        const user = new userModel();
        user.email = email;
        user.name = name;
        user.password = encryptedPassword;        
        user.status = "Hi there. I'm the new guy.";
        await user.save();

        return res.status(200).json({
            message:'User successfully created...'
        }); 
    }
    catch(err){
        if(!err.statusCode) err.statusCode = 500;
        next(err);
    }

    /*userModel.findOne(
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
                    //user.status = 1 - Awaiting confirmation within an hour
                    user.status = "1";

                    crypto.randomBytes(32, (err, buffer)=>{
                        if(err){
                            const error = new Error(err);
                            error.statusCode = 500;
                            return next(error);
                        }      
                        //no error in crypto, buffer created
                        user.confirmationToken = buffer.toString('hex');
                        user.confirmationTokenExpiration = Date.now() + 3600000;
                        user.save().then(
                            (result)=>{
                                const msg = {
                                    to: email,
                                    from: 'info@tvojmužić.com',
                                    subject: 'Account signup confirmation - TvojMužić.com',
                                    html: `
                                        <h1>Dobrodošli na sajt TvojMužić.com !!!</h1>
                                        <hr/>
                                        <h3>Molimo Vas da klikom na link ispod aktivirate vaš nalog nakon čega možete koristiti usluge našeg sajta...
                                        <a href="http://localhost:3001/activate/${user.confirmationToken}">http://localhost:3001/activate/${user.confirmationToken}</a>
                                    `
                                };                  

                                res.status(200).json({
                                    message:'User successfully created...Account awaiting for activation...'
                                });    
                                
                                return transporter.sendMail(msg).catch(err=>{console.log(err)});                       
                            }                        
                        )
                        .catch(
                            (err)=>{                             
                                const error = new Error(err);
                                error.statusCode = 422; //Unprocessable Entity
                                return next(error); 
                            }
                        )                
                    });                                       
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
    )*/
}

exports.postActivate = (req, res, next)=>{
    console.log('postActivate');

    const confirmationToken = req.params['confirmationToken'];
    if(!confirmationToken){
        const error = new Error('Invalid token');
        error.statusCode = 422;
        throw error;
    }
    
    //confirmation token ok
    userModel.findOne({
        "confirmationToken": confirmationToken,
        confirmationTokenExpiration: {
            "$gt": Date.now()
        }
    })
    .then((result)=>{
        if(result === null){
            return res.status(422).json({
                message: 'No token or token expired...'
            });
        }
        result.status = "2"; //status - 2 - Account activated
        result.save().then(
            (result)=>{
                return res.status(201).json({
                    message: 'Account successfully activated...'
                });
            }
        )
        /*.catch(
            (err)=>{
                const error=new Error('Server error. Woking on fixing the problem');
                error.statusCode = 500;
                return next(error);
            }
        )*/
    })
    .catch((err)=>{
        const error=new Error('Server error. Woking on fixing the problem');
        error.statusCode = 500;
        return next(error);
    })
}

exports.postLogin = async (req, res, next)=>{
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

    try{
        const result = await userModel.findOne({
            email: email
        });

        if(result === null)
        {
            //username not found
            const error = new Error('Username not found...');
            error.statusCode = 422;
            return next(error);
        }

        const isSame = await bcrypt.compare(password, result.password);
        if(isSame){
            const token = jwt.sign({
                email: result.email,
                userId: result._id.toString()
            }, appConfig.jwtSecretKey, {
                expiresIn: '1h'
            });                        
            return res.status(200).json({
                token: token
            });
        }
        //passwords do not match - throw error
        const error = new Error('Password invalid...');
        error.statusCode = 422;
        return next(error);
    }
    catch(err){
        if(!err.statusCode) err.statusCode = 500;
        next(err);
    }
    /*userModel.findOne({
        email: email,
        status : "2"
    }).then(
        (result)=>{  
            if(result === null)
            {
                //username not found
                const error = new Error('Username not found or account not activated...');
                error.statusCode = 422;
                return next(error);
            }
            //username found - compare password
            return bcrypt.compare(password, result.password).then(
                (isSame)=>{
                    if(isSame){
                        //passwords match                                           
                        const token = jwt.sign({
                            email: result.email,
                            userId: result._id.toString()
                        }, appConfig.jwtSecretKey, {
                            expiresIn: '1h'
                        });                        
                        return res.status(200).json({
                            token: token
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
                    const error=new Error(err);
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
    )*/
}

exports.getStatus = async (req, res, next)=>{
    //went through is-auth middleware
    try{
        const user = await userModel.findById(req.userId);

        if(user===null){
            return res.status(404).json({
                message: `User with ${req.userId} not found...`
            });
        }
        //user found
        return res.status(200).json({
            status: user.status
        });
    }
    catch(err){
        if(!err.statusCode) err.statusCode = 500;
        next(err);
    }
    /*userModel.findById(req.userId)
        .then(
            (user)=>{
                if(user===null){
                    return res.status(404).json({
                        message: `User with ${req.userId} not found...`
                    });
                }
                return res.status(200).json({
                    status: user.status
                });
            }
        )
        .catch((err)=>{
            const error = new Error('Something bad happened...');
            error.statusCode = 500;
            return next(error);
        });*/
}

exports.putStatus = async (req, res, next)=>{
    //went through is-auth middleware
    //req.body['status']

    const updatedStatus = req.body['status'];
    console.log(updatedStatus, req.userId);

    try{
        const user = await userModel.findById(req.userId);
        if(user===null){
            return res.status(404).json({
                message: `User with ${req.userId} not found...`
            });
        }
        //user !== null
        user.status = updatedStatus;
        const result = await user.save();

        return res.status(200).json({
            message: `Status successfully updated...New status ${updatedStatus}`
        });
    }
    catch(err){
        if(!err.statusCode) err.statusCode = 500;
        next(err);
    }

    /*userModel.findById(req.userId)
        .then(
            (user)=>{
                if(user===null){
                    return res.status(404).json({
                        message: `User with ${req.userId} not found...`
                    });
                }
                user.status = updatedStatus;
                user.save()
                    .then(
                        (result)=>{
                            return res.status(200).json({
                                message: `Status successfully updated...New status ${updatedStatus}`
                            });
                        }
                    )
                    .catch((err)=>{
                        const error = new Error('Something bad happened...');
                        error.statusCode = 500;
                        return next(error);
                    })                
            }
        )
        .catch((err)=>{
            const error = new Error('Something bad happened...');
            error.statusCode = 500;
            return next(error);
        });*/
}