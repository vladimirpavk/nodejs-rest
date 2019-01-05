const express = require('express');
const bodyParser = require('body-parser');

const appConfig = require('./app-config');

//routes
const feedRouter = require('./routes/feed');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/feed', feedRouter);

app.listen(appConfig.PORT);
console.log('Server is listening on port ' + appConfig.PORT);