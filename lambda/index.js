// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const https = require('https');

var today = new Date();
today.setUTCHours(0, 0, 0, 0);
var tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate()+1);
tomorrow.setUTCHours(0, 0, 0, 0);

const BASE_OCTO_API_URL = 'secret-dusk-50437.herokuapp.com';
const OCTO_API_EVENTS_PATH = '/events/';

function getEvents(date) {
    return new Promise(((resolve, reject) =>
    {
        var options = {
          host: BASE_OCTO_API_URL,
          port: 443,
          path: OCTO_API_EVENTS_PATH + date,
          method: 'GET'
        };

        const request = https.request(options, (response) => {
            response.setEncoding('utf8');
            let returnData = '';

            response.on('data', (chunk) => {
                returnData += chunk;
            });

            response.on('end', () => {
               resolve(JSON.parse(returnData));
            });

            response.on('error', (error) => {
               reject(error);
            });
        });

        request.end();
    }));
}

const OctoSearchHandler = {

    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'OctoSearchIntent';
    },
    async handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        var date = request.intent.slots.date.value;
        var speechText = 'On ' + date;

        if (date !== undefined) {
            const response = await getEvents(date);

            console.log(response);

            if (response.length === 0) {
                speechText += ", there are no events."
            } else if (response.length > 0) {
                const eventName = response[0].name;
                const eventVenue = response[0].location;
                const eventDateString = response[0].event_date;
                const eventDate = new Date(eventDateString);
                const eventDateSpeech = eventDate.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })

                speechText += ", " + eventName + " is at " + eventVenue + " at " + eventDateSpeech;
            }
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();

    }
    /*
    handle(handlerInput) {

        const request = handlerInput.requestEnvelope.request;

        var speechText = 'You made it to the octo handler.';

        var date = request.intent.slots.date.value;
        speechText += 'the date is ' + date;
        if (date !== undefined) {
            speechText += 'there is a date.';
            const qDate = new Date(date);
            if (qDate.getTime() === today.getTime()) {
                speechText += 'There is not a concert today.';
            } else if (qDate.getTime() === tomorrow.getTime()) {
                speechText += 'There is a concert tomorrow.';
            } else {
                speechText += 'q date is ' + qDate.toString();
                speechText += 'today is ' + today.toString();
                speechText += 'tomorrow is ' + tomorrow.toString();
            }
        }
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }*/
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to Upgraded Octo Adventure. Ask me if there is a concert at the hollywood bowl tonight';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'Ask me if there is a concert at the hollywood bowl tonight';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Sorry, I couldn't understand what you said. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        OctoSearchHandler,
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
