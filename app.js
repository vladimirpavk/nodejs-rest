const express = require('express');
const bodyParser = require('body-parser');

const appConfig = require('./app-config');

//routes
const feedRouter = require('./routes/feed');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

//Enable CORS calls
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
})

app.use('/feed', feedRouter);

app.listen(appConfig.PORT);
console.log('Server is listening on port ' + appConfig.PORT);