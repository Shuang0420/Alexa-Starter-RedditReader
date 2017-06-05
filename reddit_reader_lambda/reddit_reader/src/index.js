'use strict';

var request = require('request');
exports.handler = function(event, context) {
  try {
    console.log("event.session.application.applicationId") + event.session.application.applicationId;

    /**
     * Uncomment this if statement and populate with your skill's application ID to
     * prevent someone else from configuring a skill that sends requests to this function.
     */

    if (event.session.application.applicationId !== "amzn1.ask.skill.e334e348-a832-4881-bb74-80038b30cb64") {
         context.fail("Invalid Application ID");
     }


    if (event.session.new) {
      onSessionStarted({requestId: event.request.requestId}, event.session);
    }

    if (event.request.type === "LaunchRequest") {
      onLaunch(event.request,
          event.session,
          function callback(sessionAttributes, speechletResponse) {
            context.succeed(buildResponse(sessionAttributes, speechletResponse));
          });
    } else if (event.request.type === "IntentRequest") {
      onIntent(event.request,
          event.session,
          function callback(sessionAttributes, speechletResponse) {
            context.succeed(buildResponse(sessionAttributes, speechletResponse));
          });
    } else if (event.request.type === "SessionEndedRequest") {
      onSessionEnded(event.request, event.session);
      context.succeed();
    }
  } catch (e) {
    context.fail("Exception: " + e);
  }
}

/**
 * called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
  getWelcomeResponse(callback)
}


/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
  var intent = intentRequest.intent
  var intentName = intentRequest.intent.name;

  // dispatch custom intents to handlers here
  if (intentName == "") {
    handleResponse(intent, session, callback)
  } else if (intentName == "YesIntent") {
    handleYesResponse(intent, session, callback)
  } else if (intentName == "NoIntent") {
    handleNoResponse(intent, session, callback)
  } else if (intentName == "AMAZON.StopIntent") {
    // not used here
    // handleGetHelpRequest(intent, session, callback)
  } else if (intentName == "AMAZON.CancelIntent") {
    handleFinishSessionRequest(intent, session, callback)
  } else if (intentName == "AMAZON.HelpIntent") {
    handleFinishSessionRequest(intent, session, callback)
  } else {
    throw "Invalid intent"
  }

}


/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
                + ", sessionId=" + session.sessionId);
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
                + ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}


function getWelcomeResponse(callback) {
  var speechOutput = "Hello there, would you like the news?"

  var reprompt = speechOutput

  var header = "news"

  var shouldEndSession = false

  var sessionAttributes = {
    "speechOutput": speechOutput,
    "repromptText": reprompt
  }

  callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
}


function handleYesResponse(intent, session, callback) {
  get_headlines(function(headlines) {
    var speechOutput = 'The current world news headlines are ' + headlines;
    var shouldEndSession = true
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", shouldEndSession))
  });
}


function handleNoResponse(intent, session, callback) {
  var speechOutput = 'I am not sure why you asked me to run then, but okay... bye'
  var shouldEndSession = true
  callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", shouldEndSession))
}



//title: title of card
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
  return {
    outputSpeech: {
      type: "PlainText",
      text: output
    },
    card: {
      type: "Simple",
      title: title,
      content: output
    },
    reprompt: {
      outputSpeech: {
        type: "PlainText",
        text: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  };
}


function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
  return {
    outputSpeech: {
      type: "PlainText",
      text: output
    },
    reprompt: {
      outputSpeech: {
        type: "PlainText",
        text: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  };
}


function buildResponse(sessionAttributes, speechletResponse) {
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }
}


function handleFinishSessionRequest(intent, session, callback) {
  callback(session.attributes, buildSpeechletResponseWithoutCard("Good bye! Thank you for using Reddit Reader","",true))
}


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
