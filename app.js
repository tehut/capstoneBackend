
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var express = require('express');
var request = require('request');
var qs  = require('querystring');
var port = process.env.PORT || 1337;
var QuickBooks = require('node-quickbooks');
var accessToken = process.env.APP_TOKEN;
var consumerKey = process.env.CONSUMER_KEY;
var consumerSecret = process.env.APP_TOKEN;
var url = 'sandbox-quickbooks.api.intuit.com/';
var token = process.env.ACCESS_TOKEN;
var tokenSecret = process.env.ACCESS_SECRET;
var realmId = process.env.REALM_ID;
var username = process.env.ADMIN_EMAIL;
var password = process.env.ADMIN_PASSWORD;
var tcURL = 'https://www.transparentclassroom.com/';
var lastCallDate = '2017-06-06';
var qbURL = 'https://quickbooks.api.intuit.com/v3/company/' + realmId;
var newApps = [];
var http       = require('http');
var util       = require('util');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session    = require('express-session');
var oauthSignature = require('oauth-signature')


// Query Transparent Classroom API for all applications posted after lastCallDate
function pullApplications (lastCallDate){
  var options = {
    url: tcURL + '/api/v1/online_applications.json' + '?created_at=' + lastCallDate,
    method: 'GET',
    headers: {
      'X-TransparentClassroomToken': 'fom7Lc4v8TyniH5nWcp8'
    }
  }

// On success updated lastCallDate and save retrieved applications to newApps object
  request(options,function(err,response,body){
  if(err) {
    console.log(err);
    return;
  } else {
    newApps = response.body
    lastCallDate = response.caseless.dict.date
    console.log('here');
    console.log(lastCallDate);
    console.log(body);
  }
});
}




// pullApplications(lastCallDate)


app.get('/requestToken', function(req, res) {
  var postBody = {
    url: QuickBooks.REQUEST_TOKEN_URL,
    oauth: {
      callback:        'http://localhost:' + port + '/callback/',
      consumer_key:    consumerKey,
      consumer_secret: consumerSecret
    }
  }
  request.post(postBody, function (e, r, data) {
    var requestToken = qs.parse(data)
    req.session.oauth_token_secret = requestToken.oauth_token_secret

    res.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token)
  })
  console.log(data);
  console.log(postBody);
  console.log(requestToken);
})

//
// function callback(error, response, body) {
//   if (!error && response.statusCode == 200) {
//     var info = JSON.parse(body);
//     console.log(info)
//   }
// }
//
// request(options, callback);

// console.log("this is here");
// save the access token somewhere on behalf of the logged in user
qbo = new QuickBooks(consumerKey,
                     consumerSecret,
                     accessToken,
                     tokenSecret,
                     realmId,
                     true, // use the Sandbox
                     true); // turn debugging on

// test out account access
// qbo.findAccounts(function(_, accounts) {
  // console.log(response);
  // accounts.QueryResponse.Account.forEach(function(account) {
    // console.log(account.Name)
  // })
// })

// })
// res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>')
// })
//
// var express = require('express');
// var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
// var mongoose = require('mongoose');
// var env = require('node-env-file');
//
// var app = express();
//
// // if in development mode, load .env variables
// if (app.get("env") === "development") {
//     env(__dirname + '/.env');
// }
//
// // connect to database
// app.db = mongoose.connect(process.env.MONGODB_URI);
//
// // view engine setup - this app uses Hogan-Express
// // https://github.com/vol4ok/hogan-express
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'html');
// app.set('layout','layout');
// app.engine('html', require('hogan-express'));;
//
// // uncomment after placing your favicon in /public
// //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//
// // our routes will be contained in routes/index.js
// var routes = require('./routes/index');
// app.use('/', routes);
//
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
// // error handlers
//
// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.json({
//       message: err.message,
//       error: err
//     });
//   });
// }
//
// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.json({
//     message: err.message,
//     error: {}
//   });
// });
//
//
// module.exports = app;
