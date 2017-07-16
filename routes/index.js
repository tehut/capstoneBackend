'use strict'

const env            = require('node-env-file');
env(__dirname + '/../.env');
const express        = require('express');
const mongoose       = require('mongoose');
const request        = require('request');
const Promise        = require('bluebird')
const qs             = require('querystring');
const http           = require('http');
const util           = require('util');
const bodyParser     = require('body-parser');
const cookieParser   = require('cookie-parser');
const session        = require('express-session');
const oauthSignature = require('oauth-signature')
const QuickBooks     = require('node-quickbooks');
const port           = process.env.PORT || 1337;
const app            = express();
const consumerKey    = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const url            = 'sandbox-quickbooks.api.intuit.com/';
const appToken       = process.env.APP_TOKEN;
const accessToken    = process.env.ACCESS_TOKEN;
const accessSecret   = process.env.ACCESS_SECRET;
const realmId        = process.env.REALM_ID;
const username       = process.env.ADMIN_EMAIL;
const password       = process.env.ADMIN_PASSWORD;
const tcToken        = process.env.TC_TOKEN;
const tcURL          = 'https://www.transparentclassroom.com/';
const qbURL          = 'https://quickbooks.api.intuit.com/v3/company/' + realmId;
let lastCallDate   = '2017-06-06';

Promise.promisifyAll(request);

// defining the Customer object to hold the parsed response
function Customer(response){
  this.studentType = response.fields['Select One']
  this.sessions = response.fields['Which session(s) would you like to register for?']
  this.gName = response.fields['child_name.first'];
  this.famName = response.fields['child_name.last'];
  this.parents = response.fields['mother/Guardian_name.first']; + ' & ' + response.fields['father/guardian_name.first']
  this.pEmails = response.fields['mother_email'] + ", " + response.fields['father_email']
  // this.sGuardianEmail = response.fields['Secondary Guardian_email']
}


// defining the getFullApplications function where the indiv application is called
function getFullApplications(newAppIds){
  // customerList = [];
  newAppIds.forEach(function(child){
    console.log('inside loop');
    console.log(child);
    var childOptions = {
      url: tcURL + 'api/v1/online_applications/' + child+ '.json' ,
      method: 'GET',
      headers: {
        'X-TransparentClassroomToken': tcToken
      }
    };
    request.getAsync(childOptions)
    .then((response) => {

      let bodyObject = JSON.parse(response.body);

      console.log(typeof Object.keys(bodyObject.fields));
      // console.log(Object.keys(bodyObject.fields));
      for (var keys of Object.keys(bodyObject.fields)){
        if (keys.includes("email")) {
          console.log(keys);

        }
      }


  });
});
}

function pullApplications (lastCallDate){
  console.log(lastCallDate);
  const options = {
    url: tcURL + 'api/v1/online_applications.json' ,
    method: 'GET',
    headers: {
      'X-TransparentClassroomToken': tcToken
    }
  };


  request.getAsync(options)
  .then((response) => {
    const newAppIds      = [];
    let newApps = JSON.parse(response.body);

    lastCallDate = response.caseless.dict.date
    for (var app of newApps){
      newAppIds.push(app.id);
    }
    return new Promise.resolve(newAppIds)
    .then((newapps) => {
      console.log('this is new apps');
      getFullApplications(newAppIds)
    });

  });

}


pullApplications(lastCallDate);
