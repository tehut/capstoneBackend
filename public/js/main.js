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
const tcURL          = 'http://localhost:3000/';
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
};


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
  return request.getAsync(options)
};

function buildAppIdArray (response){
  const newAppIds      = [];
  let newApps = JSON.parse(response.body);
  lastCallDate = response.caseless.dict.date
  for (var app of newApps){
    newAppIds.push(app.id);
  }
  return new Promise.resolve(newAppIds)
}

// defining the getFullApplications function where the indiv application is called
// let customerList = [];
  function scrubResponse(response){
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


    return(thisCustomer);
  };


  function getFullApplications(newAppIds){
    let appResponses = [];
    let customerList = [];

    for (var i = 0; i <newAppIds.length; ++i){
      var childOptions = {
        url: tcURL + 'api/v1/online_applications/' + newAppIds[i]+ '.json' ,
        method: 'GET',
        headers: {
          'X-TransparentClassroomToken': tcToken
        }
      };
      appResponses.push(request.getAsync(childOptions))
      }
      Promise.all(appResponses)

        .then(function(customerList){
          return customerList.map(customer => {
            return scrubResponse(customer)
          })
        }).then((customers)=> {
          let invoiceArray =[];
          customers.forEach(customer=>{
            let qbo = new QuickBooks(consumerKey,
              consumerSecret,
              accessToken,
              accessSecret,
              realmId,
              true, // use the Sandbox
              true);
            var customerQuery = [
                            {field: 'fetchAll', value: true},
                            // {field: 'GivenName', value: customer.gName, operator: 'LIKE'},
                            {field: 'FamilyName', value: customer.famName, operator: 'LIKE'}
            ]
            qbo.findCustomers(customerQuery,function(error, response){
              // TODO: The app currently doesn not return an error when there is no student Found
              // Amerlia Fu is not a customer but she just returns an empty object==? "QueryResponse": {}
              if(response.QueryResponse != {}){
                console.log('this is the response ');

                let sessions = ""
                 customer.sessions.forEach((customer)=>{
                   sessions += customer
                });
                // console.log(sessions);
                // var invoiceObject = {
                //   "Invoice": {
                //     "Deposit": 0,
                //     "domain" : "QBO",
                //     ''
                //   }
                // }
                console.log('#######################');
                console.log(response.QueryResponse.Customer.id);
                  if (customer.sessions.length == 2) {
                  console.log("Summer and Fall Registration & Craft Fees : \" $350 \" ");
                } else if (customer.sessions.length == 1 && sessions.includes("school years")){
                  console.log("Fall Registration & Craft Fees : \" $250 \" ");
                }else if (customer.sessions.length == 1 && sessions.includes("summer")){
                  console.log("Summer Registration & Craft Fees : \" $200 \" ");
                }
            }
              else {
                console.log(response.QueryResponse);
              }
          },this)
        })
      });
    };

function postCustomer(customerList){
  console.log("this is postCustomer" +customerList);
  let qbo = new QuickBooks(consumerKey,
    consumerSecret,
    accessToken,
    accessSecret,
    realmId,
    true, // use the Sandbox
    true); // turn debugging on
    // console.log("this is customerList " + customerList);

    qbo.findCustomers([

      {field: 'fetchAll', value: true},
      {field: 'GivenName', value: 'Oren', operator: 'LIKE'},
      {field: 'FamilyName', value: 'Hess', operator: 'LIKE'}
    ], function(error, response){
        // console.log("TG>>> respons in the callback: " + Object.keys(response.QueryResponse.Customer));
        response.QueryResponse.Customer.forEach(function(customer){
          // return new Promise
        });
      });
  };


pullApplications(lastCallDate)
  .then(buildAppIdArray)
  .then(getFullApplications)
  // .then(postCustomer)


// Another approach to promises.map

  // .each(function(response){
  //
  //   // appResponses.each(function(response){
  //   customerList.push(scrubResponse(response));
  //   // console.log(response. .body);
  //   // });
  //   // for (var i = 0; i <appResponses.length; ++i){
  //   //   console.log(appResponses[i].Promise.IncomingMessage);
  //   // console.log( customerList)
  //   return customerList
  // })
