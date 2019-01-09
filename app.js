const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const appConfig = require('./app-config');

//routes
const feedRouter = require('./routes/feed');

const app = express();

app.use(bodyParser.json());

//set static routes
app.use('/images', express.static(path.join(__dirname, 'images')));

//Enable CORS calls
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
})

app.use('/feed', feedRouter);

app.use(
    (error, req, res, next)=>{
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
);

mongoose.connect(appConfig.mongooseConnectionString, { useNewUrlParser: true })
  .then(
    (result)=>{
      //connected
      console.log('Connected to testBaza');   
      app.listen(3000);
    }
  )
  .catch(
    (err)=>{
      throw new Error(err);
      //console.log('Something bad happened...');
    }
  );

app.listen(appConfig.PORT);
console.log('Server is listening on port ' + appConfig.PORT);