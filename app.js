const express = require('express');
const path = require('path');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const uuidv4 = require('uuid/v4');
const io = require('./socket');

const appConfig = require('./app-config');

//routes
const feedRouter = require('./routes/feed');
const authRouter = require('./routes/auth');

const app = express();

app.use(bodyParser.json());

//multer configuration
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb)=>{
        cb(null, uuidv4());
    }
});

const fileFilter = (req, file, cb)=>{
    if(file.mimetype === 'image/png' ||
       file.mimetype === 'image/jpg' ||
       file.mimetype === 'image/jpeg'){
         cb(null, true);
       }
    else{
      cb(null, false);
    }
  }

app.use(multer(
{
    storage: fileStorage,
    fileFilter: fileFilter
}
).single('image'));

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
app.use('/auth', authRouter);

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
      const httpHandler = app.listen(appConfig.PORT);
      
      const ioHandler = io.init(httpHandler);
      ioHandler.on('connection', (socket)=>{
          console.log('Client connected...');
      });

      console.log('Server is listening on port ' + appConfig.PORT);
    }
  )
  .catch(
    (err)=>{
      throw new Error(err);
      //console.log('Something bad happened...');
    }
  );