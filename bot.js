/*
  Main logic and function of the bot
  
  All functions not explicitly stated written by @groupme

*/
var HTTPS = require('https')
var request = require('request')
var time = require('time')
// Global variables to translate from date object numbers
// to string representations
var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
var botID = process.env.BOT_ID;

// Written by @domtheporcupine
function respond() {
  // Grab incoming text
  var request = JSON.parse(this.req.chunks[0])
  var botRegex = /^\/time*/
  
  // Check if someone is calling timebot
  if(request.text && botRegex.test(request.text)) {
    
    var search = request.text.replace("/time ", "")
    
    var sanityCheck = /^[a-zA-Z0-9 ]+$/;

    // Check to make sure we have no weird symbols
    if(!(sanityCheck.test(search))) {
      postMessage("NO, you're trying to hack me :(");
    } else {
      // create Date object
      var d = new time.Date()
      // Set it to current UTC time
      d.setTimezone('UTC')

      // If we want to know about eric, set offset to +10
      if(search.toLowerCase() === "eric") {
        postMessage(date_to_string(d, 10))
      // If we want to know about dom, set offset to +1
      } else if(search.toLowerCase() === "dom") {
        postMessage(date_to_string(d, 1))
      // If we want to know how to use the bot send a
      // simple help message
      } else if(search.toLowerCase() === "help") {
        postMessage("I'm a super simple bot!\n" +
                    "To use me simply send this:\n" +
                    "/time [name]\n" +
                    "currently supported names:\n" +
                    "dom & eric")
      }
    }
  }

  // Finally sent a 200 OK http status
  this.res.writeHead(200);
  this.res.end();
}

// Given a number of hours in military time
// determine if it is AM or PM and return that
// string
// Written by @domtheporcupine
function ampm(hours) {
  if(hours/12 == 0 || hours > 23) {
    return 'AM'
  }
  return 'PM'
}

// Simple wrapper for months array, will be useful when
// month overflow is implemented. i.e. when it is the
// 31st at UTC, but the 1st in some timezone that is ahead
// Written by @domtheporcupine
function moty(num) {
  return months[num]
}

// Simple day of the week wrapper for the days array
// Written by @domtheporcupine
function dotw(num) {
  return days[num]
}

// Given a date object and an offset determine
// if it is the 'next' day, return 1 if it is
// otherwise return 0
// Written by @domtheporcupine
function potential_next_day(d, off) {
  if((d.getHours() + off) > 23) {
    return 1
  }
  return 0
}

// Given a number of hours in military time
// convert it to non military time, i.e.
// 13 -> 1
// Written by @domtheporcupine
function mil_to_stand(hours) {
  if(hours > 12) {
    return (hours % 12)
  }
  return hours
}

// Given a date object and an offset return a string
// in the format:
// [day of the week] [month] [date], [hours]:[minutes] [AM/PM]
// example: Sun May 7, 11:19 PM
// Written by @domtheporcupine
function date_to_string(d, offset) {
  
  return dotw(d.getDay() + potential_next_day(d, offset)) + 
    " " + moty(d.getMonth()) + " " + (d.getDate() + potential_next_day(d, offset)) + ", " + 
    mil_to_stand(d.getHours() + offset) + ":" + d.getMinutes() + 
    " " + ampm(d.getHours() + offset)
}

function postMessage(resp) {
  var botResponse, options, body, botReq;

  botResponse = resp;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

exports.respond = respond;
