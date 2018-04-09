const nodemailer = require('nodemailer');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// POST route from contact form
app.post('/contact', function (req, res) {
  var mailOpts, smtpTrans;
  smtpTrans = nodemailer.createTransport('SMPT',{
    service: 'Gmail',
    auth: {
      user: "contactpinpints@gmail.com",
      pass: "Webdev123"
    }
  });
  mailOpts = {
    from: req.body.name + ' &lt;' + req.body.email + '&gt;',
    to: 'contactpinpints@gmail.com',
    subject: ${req.body.subject},
    text: ${req.body.msg}
  };
  smtpTrans.sendMail(mailOpts, function (error, response) {
    if (error) {
      res.render('contact-failure');
    }
    else {
      res.render('contact-success');
    }
  });
});
