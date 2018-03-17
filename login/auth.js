var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require('include/config.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function authenticate(){

}

app.post('/restApi/register', function(req, res){
    var login = req.body.login
    var email = req.body.login
    var password = req.body.login

    if(login === undefined || email === undefined || password === undefined){
        res.status(400).json({ error: 'true', message:"A parameter is empty or missing" });
    }

    if(validateEmail(email)){

    }else{
        res.status(400).json({ error: 'true', message:"Email address is not valid" });
    }
});

app.post('/restApi/login', function(req, res){
    res.status(200).send("coucou");
});

app.get('/restApi/*', function(req, res){
    res.status(404).send("invalidRequest");
});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

app.listen(8080);