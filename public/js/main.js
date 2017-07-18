'use strict'

const env            = require('node-env-file');
env(__dirname + '/../../.env');
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
let lastCallDate     = '06-01-2017'
let join             = Promise.join;

Promise.promisifyAll(request);

// defining the Customer object to hold the parsed response
function Customer(response){
  this.studentType = response.fields['Select One']
  this.sessions = response.fields['Which session(s) would you like to register for?']
  this.gName = response.fields['child_name.first'];
  this.famName = response.fields['child_name.last'];
  this.parents = response.fields['mother/Guardian_name.first']; + ' & ' + response.fields['father/guardian_name.first']
  this.pEmails = response.fields["mother_email"] + ", " + response.fields["father_email"]
  // this.sGuardianEmail = response.fields['Secondary Guardian_email']
}


// defining the getFullApplications function where the indiv application is called
// let customerList = [];
function getFullApplications(newAppIds){
  let appResponses = [];
  for (var i = 0; i <newAppIds.length; ++i){
    // newAppIds.forEach(function(appIdNumber){

    // console.log('inside loop');
    // console.log(child);
    var childOptions = {
      url: tcURL + 'api/v1/online_applications/' + newAppIds[i]+ '.json' ,
      method: 'GET',
      headers: {
        'X-TransparentClassroomToken': tcToken
      }
    };
    appResponses.push(request.getAsync(childOptions))
    }
    Promise.all(appResponses).each(function(response){
      // appResponses.each(function(response){
      scrubResponse(response)
      // });
      // for (var i = 0; i <appResponses.length; ++i){
      //   console.log(appResponses[i].Promise.IncomingMessage);
    });

      // console.log("all  done");
    // };
  }

  function scrubResponse(response){
    //

      let bodyObject = JSON.parse(response.body);
      let thisCustomer = new Customer(bodyObject);
      // scrubbing output for errors from variation in json keys
        if (thisCustomer.parents === undefined){
          thisCustomer.parents = bodyObject.fields['Primary Legal Guardian name:.first'] + ' & ' +bodyObject.fields['Secondary Guardian name:.first']
        }
        if (bodyObject.pEmails === undefined) {
          thisCustomer.pEmails = bodyObject.fields['Primary Guardian_email '] + ' , ' + bodyObject.fields['Secondary Guardian_email']
        } else if (bodyObject.fields.mother_email.includes(bodyObject.fields.father_email)){
          thisCustomer.pEmails = bodyObject.fields.mother_email;
        }
        console.log("working on element");
  };
      // customerList.push(thisCustomer);
      // return new Promise.resolve(customerList)
      // console.log(customerList);
      // })

    // Promise.all(customerList)

    // return customerList
    //
    // })
  //   .then((customerList) => {
  //     console.log(customerList);
  // //
  //     console.log('last promise');
  //     console.log(customerList);
  //     // return Promise.resolve(customerList)
  //   })
  //   .then((customerList) => {
  //     // console.log('after promise');
  //   return Promise.resolve(customerList)
  // })
  // .then((customerList) => {
  //   return Promise.resolve(customerList)
  // })
  // .then((customerList) => {
  //   console.log(customerList);
  // })
  //   .catch((error) => {
  //     console.log(error);


  // });
// };
// console.log(customerList);



function pullApplications (lastCallDate){
// I think i'm giong to have to store lastCallDate in the database otherwise it wont persist between scripts
  // if(!lastCallDate){lastCallDate = Date.}
  const options = {
    url: tcURL + 'api/v1/online_applications.json' + '?created_at=' + lastCallDate,
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
      getFullApplications(newAppIds)
    });

  })
  .catch((error) => {
    console.log(error)
  });
};



// createCustomer(newAppIds)
function postCustomer(customerList){
  console.log(customerList);
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
var options = {
  "GivenName":"d",
  "FamilyName":"James",
  'BillAddr': {
    "Line1": "Jim and James"
  },
  'PrimaryEmailAddr': {
    "Address":
      "Jenny@a.com, mark@sdfsdmark.com"

  }
};

  qbo.createCustomer(options, function(error,body){
//
console.log("this is body" + Object.keys(body))
console.log("this is error" + Object.keys(error));
// console.log(Customer);


  console.log(Object.keys(QueryResponse));
  console.log(QueryResponse.QueryResponse.Customer[0].PrimaryEmailAddr);
  accounts.findCustomers.Account.forEach(function(account) {
    console.log(account.Name)
  })
});

};




pullApplications(lastCallDate)
  // .then(getFullApplications(newAppIds))
  // .then(postCustomer(customerList));
// // })
// // res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>')
// //
