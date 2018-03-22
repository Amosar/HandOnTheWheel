const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Used for authenticate system.
require('./auth.js')(app);

//Used for static html files
app.use(express.static('public'));

app.listen(8080);
