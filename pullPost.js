require('node-env-file');

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var express = require('express');
var request = require('request');
var qs  = require('querystring');
var port = process.env.PORT || 1337;
var QuickBooks = require('node-quickbooks');
var app_token = process.env.APP_TOKEN;
var consumerKey = process.env.CONSUMER_KEY;
var consumerSecret = process.env.APP_TOKEN;
var url = 'sandbox-quickbooks.api.intuit.com/';
var token = process.env.ACCESS_TOKEN;
var tokenSecret = process.env.ACCESS_SECRET;
var realmID = process.env.REALM_ID;
var username = process.env.ADMIN_EMAIL;
var password = process.env.ADMIN_PASSWORD;
var tcURL = 'https://www.transparentclassroom.com/';var lastCallDate = '2017-06-06';
var qbURL = 'https://quickbooks.api.intuit.com/v3/company/' + realmID;
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
    }
  });
}




pullApplications(lastCallDate);


function pullInvoices(){
  var generateNonce = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  var oauth_nonce = generateNonce(32)
  console.log(oauth_nonce);

  var httpMethod = 'GET',
  url = qbURL,
  parameters = {
    oauth_consumer_key : consumerKey,
    oauth_token : token,
    oauth_nonce : oauth_nonce,
    oauth_timestamp : '1191242096',
    oauth_signature_method : 'HMAC-SHA1',
    oauth_version : '1.0',
  },
  consumerSecret = consumerSecret,
  tokenSecret = tokenSecret,
  // generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash
  encodedSignature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret),
  // generates a BASE64 encode HMAC-SHA1 hash
  signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret,
    { encodeSignature: true});


    var options ={
      url: qbURL + 'query?query=SELECT * FROM Invoice',
      headers: {
        Authorization: {
          oauth_consumer_key: consumerKey,
          oauth_nonce: oauth_nonce,
          oauth_signature: signature,
          oauth_signature_method:"HMAC-SHA1",
          oauth_timestamp:Date.now(),
          oauth_token: token,
          oauth_version:"1.0"
        },
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': 278,
        'Host': 'quickbooks.api.intuit.com',
        'User-Agent': 'APIExplorer'
      }
    }

    request(options,function(err,response,body){

      if(err) {
        console.log(err);
        return;
      } else {

        console.log(response);
      }
    });

  }
pullInvoices();
  // save the access token somewhere on behalf of the logged in user
  // qbo = new QuickBooks(consumerKey,
  //                      consumerSecret,
  //                      token,
  //                      tokenSecret,
  //                      realmID,
  //                      true, // use the Sandbox
  //                      true); // turn debugging on

  // test out account access
  // qbo.findAccounts(function(_, accounts) {
  //   accounts.QueryResponse.Account.forEach(function(account) {
  //     console.log(account.Name)
  //   })
  // })



  // test out account access
  // qbo.findInvoices('registration',function(error,response,body) {
  //   if(error) {
  //     console.log(error);
  //     return;
  //   } else {
  //     console.log('here');
  //     console.log(body);
  //   }
  // })

  // })
  // res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>')
  // })
  // I think what I'd like to do in the medium term is to create an InvoiceCall object and save
  // lastCallDate and the invoice array to that object
