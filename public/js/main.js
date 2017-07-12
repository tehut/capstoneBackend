var env = require('node-env-file')
  env(__dirname + '/../../.env')
//
// var express = require('express');
// var app = express();
// var mongoose = require('mongoose');
// var express = require('express');
// var request = require('request');
// var QuickBooks = require('node-quickbooks');
// var app_token = process.env.APP_TOKEN;
// var consumerKey = process.env.CONSUMER_KEY;
// var consumerSecret = process.env.APP_TOKEN;
// var accessToken = process.env.ACCESS_TOKEN;
// var accessSecret = process.env.ACCESS_SECRET;
// var realmID = process.env.REALM_ID;
// var url = 'sandbox-quickbooks.api.intuit.com/';
// var username = process.env.ADMIN_EMAIL;
// var password = process.env.ADMIN_PASSWORD;
// var tcURL = 'https://www.transparentclassroom.com/';
// var lastCallDate = '2017-06-06';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var express = require('express');
var request = require('request');
var qs  = require('querystring');
var port = process.env.PORT || 1337;
var QuickBooks = require('node-quickbooks');
var consumerKey = process.env.CONSUMER_KEY;
var consumerSecret = process.env.CONSUMER_SECRET;
var url = 'sandbox-quickbooks.api.intuit.com/';
var appToken = process.env.APP_TOKEN;
var accessToken = process.env.ACCESS_TOKEN;
var accessSecret = process.env.ACCESS_SECRET;
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
console.log(accessToken);
console.log(consumerKey);


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
  // console.log(data);
  // console.log(postBody);
  // console.log(requestToken);
})

qbo = new QuickBooks(consumerKey,
                     consumerSecret,
                     accessToken,
                     accessSecret,
                     realmId,
                     true, // use the Sandbox
                     true); // turn debugging on

// test out account access
qbo.findCustomers(function(_,QueryResponse) {
var options {

}
  console.log(Object.keys(QueryResponse));
  console.log(QueryResponse.QueryResponse.Customer[0].PrimaryEmailAddr);
  // accounts.findCustomers.Account.forEach(function(account) {
  //   console.log(account.Name)
  // })
})

// })
// res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>')
// })
//
