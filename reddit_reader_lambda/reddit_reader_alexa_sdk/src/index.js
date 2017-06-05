'use strict';

var Alexa = require("alexa-sdk");

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context, callback);
  alexa.appId = "amzn1.ask.skill.e334e348-a832-4881-bb74-80038b30cb64";
  alexa.registerHandlers(handlers);
  alexa.execute();
}

var handlers = {
  "LaunchRequest": function() {
    var speechOutput = "Hello there, would you like the news?";
    var reprompt = speechOutput;
    this.emit(':ask', speechOutput, reprompt);
  },
  "YesIntent": function() {
    var self = this;
    get_headlines(function(headlines) {
      var speechOutput = 'The current world news headlines are ' + headlines;
      self.emit(':tell', speechOutput);
    });
  },
  "NoIntent": function() {
    var speechOutput = 'I am not sure why you asked me to run then, but okay... bye'
    this.emit(':tell', speechOutput);
  },
  "AMAZON.StopIntent": function() {
    var speechOutput = "Good bye! Thank you for using Reddit Reader";
    this.emit(':tell', speechOutput);
  },
  "AMAZON.CancelIntent": function() {
    var speechOutput = "Good bye! Thank you for using Reddit Reader";
    this.emit(':tell', speechOutput);
  },
}


var request = require('request');
function get_headlines(callback) {
  request('https://reddit.com/r/worldnews/.json?limit=10', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var body=JSON.parse(body)['data']['children'];
      var res = "";
      body.forEach(function(ele){
        res = res + ele['data']['title'] + " ";
      });
    }
    return callback(res);
  });
}
