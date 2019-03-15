'use strict'

const token = process.env.FB_PAGE_ACCESS_TOKEN
const vtoken = process.env.FB_VERIFY_ACCESS_TOKEN

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === vtoken) {
        res.send(req.query['hub.challenge'])
    }
    res.send('No sir')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
    var data = request.body;
console.log('received bot webhook');
// Make sure this is a page subscription
if (data.object === 'page') {
// Iterate over each entry - there may be multiple if batched
data.entry.forEach(function (entry) {
// Here you can obtain values about the webhook, such as:
var pageID = entry.id
var timeOfEvent = entry.time
entry.messaging.forEach(function (event) {
if (event.message) {
receivedMessage(event);
} else if (event.game_play) {
receivedGameplay(event);
} else {
console.log('Webhook received unknown event: ', entry.id);

}
});
});
}
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
      if (event.message && event.message.text) {
        let text = event.message.text
        if (text === 'Generic') {
            sendGenericMessage(sender)
            continue
        }
        sendTextMessage(sender, "Message received: " + text.substring(0, 200))
      }
      if (event.postback) {
        let text = JSON.stringify(event.postback)
        sendTextMessage(sender, "Postback: "+text.substring(0, 200), token)
        continue
      }
    }
    res.sendStatus(200)
  })


function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
   
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
function receivedGameplay (event) {
// Page-scoped ID of the bot user
var senderId = event.sender.id;

// FBInstant player ID: event.game_play.player_id
// FBInstant context ID: event.game_play.context_id
// User's Page-scoped ID: event.sender.id

// Check for payload
if (event.game_play.payload) {
//
// The variable payload here contains data set by
// FBInstant.setSessionData()
//
var payload = JSON.parse(event.game_play.payload);

// In this example, the bot is just "echoing" the message received
// immediately. In your game, you'll want to delay the bot messages
// to remind the user to play 1, 3, 7 days after game play, for example.
sendMessage(senderId, null, 'wali tal3ab azaml 😂 '+ event.eventsSeen, 'Play now!', payload);
}
}
function sendMessage(player, context, message, cta, payload) {
var button = {
type: 'game_play',
title: cta
};

if (context) {
button.context = context;
}
if (payload) {
button.payload = JSON.stringify(payload);
}
var messageData = {
recipient: {
id: player
},
message: {
attachment: {
type: 'template',
payload: {
template_type: 'generic',
elements: [
{
title: message,
buttons: [button]
}
]
}
}
}
};

callSendAPI(messageData);
}

