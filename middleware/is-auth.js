const jwt = require('jsonwebtoken');
const appConfig = require('../app-config');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    
    if(!authHeader){
        //no token in header
        const error = new Error('No authorization header...');
        error.statusCode = 401;
        throw error;
    }

    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, appConfig.jwtSecretKey);      
    }
    catch(err){
        const error = new Error(err);
        error.statusCode = 500;
        throw error;
    }

    if( !decodedToken ){
        const error = new Error('Not authenticated');
        error.statusCode(401);
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
}

