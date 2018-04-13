const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const port = process.env.PORT || 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//app.use(require('morgan')('combined')); //useful value :dev, combined


//Used for authenticate system.
require('./auth.js')(app);

app.use(express.static('public'));

//Used for static html files
app.set('views', __dirname + '/views/pages');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index', {auth: req.isAuthenticated()});
});

app.get('/about', function (req, res) {
    res.render('about', {auth: req.isAuthenticated()});
});

app.get('/account', function (req, res) {
    res.render('account', {auth: req.isAuthenticated()});
});

app.get('/bar', function (req, res) {
    res.render('bar', {auth: req.isAuthenticated()});
});

app.get('/contact', function (req, res) {
    res.render('contact', {auth: req.isAuthenticated(), msg:""});
});

app.get('/*', function (req, res) {
    res.redirect('/', {auth: req.isAuthenticated()});
});

// POST route from contact form
app.post('/contact', function (req, res) {
  //setup smtp setting gmail
  var mailOpts, smtpTrans;
  smtpTrans = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: "contactpinpints@gmail.com", //username for gmail
      pass: "zkkiniafavawgsyw" //secure app password
    }
  });

  mailOpts = {
    from: req.body.email, //email address from form
    to: 'contactpinpints@gmail.com', //send to pinpints address
    subject: req.body.subject, //subject from form
    //add name, email and messge from form
    text: `${req.body.name} <${req.body.email}> says: ${req.body.msg}`
  };
  smtpTrans.sendMail(mailOpts, function (error, response) {
    if (error) {
      //set div to visable with failed message and allow user to close
      res.render('contact', {auth: req.isAuthenticated(), msg: `<div class=\"alert alert-danger\" role=\"alert\">
      <a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Message failed to send</div>`});
    }
    else {
      //set div to visable with sent message and allow user to close
      res.render('contact', {auth: req.isAuthenticated(), msg: `<div class=\"alert alert-success\" role=\"alert\">
      <a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Message sent</div>`});
    }
  });
});
app.listen(port);
