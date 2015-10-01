// server.js

// set up ======================================================================
// get all the tools we need
var express      = require('express');
var schedule     = require('node-schedule');
var port     	   = process.env.PORT || 8000;
var app      	   = express();
var request      = require('request');
var nodemailer   = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '@gmail.com',
        pass: ''
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Text ✔ <@gmail.com>', // sender address
    to: '@gmail.com', // list of receivers
    subject: 'Your IP ✔', // Subject line
    text: '', // plaintext body
    html: '' // html body
};

var old_ip       = null;
app.set('port', process.env.PORT || 3000);


// launch ======================================================================
app.listen(app.get('port'), function(){
  var options = {
    url: 'http://ifconfig.me/ip',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
    }
  };

  function sendEmail(text) {
    mailOptions.text = text;
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
  }

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      body = body.trim();
      if(old_ip == null) {
        old_ip = body;
        sendEmail(old_ip);
      }
      else if(old_ip != body) { console.log('old ip: ' + old_ip + ' new ip: ' + body); old_ip = body; sendEmail(old_ip);}
      else if(old_ip == body) { console.log('old ip: ' + old_ip + ' new ip: ' + body); }
    }
  }

  var j = schedule.scheduleJob('0 * * * * *', function(){
    console.log(new Date());
    request(options, callback);
  });
});
