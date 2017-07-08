require('node-env-file')

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var express = require('express');
var request = require('request');
var QuickBooks = require('node-quickbooks');
var app_token = process.env.APP_TOKEN;
var consumerKey = process.env.CONSUMER_KEY;
var consumerSecret = process.env.APP_TOKEN;
var url = 'sandbox-quickbooks.api.intuit.com/';
var username = process.env.ADMIN_EMAIL;
var password = process.env.ADMIN_PASSWORD;
var baseURL = 'https://www.transparentclassroom.com/';
// var authURL = 'https://' + username + ':' + password+ '@'+ baseURL + 'api/v1/authenticate.json'
var lastCallDate = '2017-06-06';


function pullApplications (lastCallDate){
var options = {
  url: baseURL + '/api/v1/online_applications.json' + '?created_at=' + lastCallDate,
  headers: {
    'X-TransparentClassroomToken': 'fom7Lc4v8TyniH5nWcp8'
  },
}

request.get(options, function (err, response, body){
  if(err) {
    console.log(err);
    return;
  } else {
    console.log(body);
    console.log(response.caseless.dict.date);
  }
});

}

pullApplications(lastCallDate)
