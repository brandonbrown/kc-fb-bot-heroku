var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (request, response) {
    response.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (request, response) {
    if (request.query['hub.verify_token'] === 'fbinstant-communication') {
        response.send(request.query['hub.challenge']);
        return "hello baby",200
    } else {
        response.send('Invalid verify token');
    }
});


// handler receiving messages

app.post('/webhook', function (request, response) {

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
   
    var events = request.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            sendMessage1(event.sender.id, {text: "L3eb Wla 9wed  😂 : " + event.message.text});
                console.log('chat bot webhook');

        }
    }

   
    response.sendStatus(200);
});
  //
  // Handle messages sent by player directly to the game bot here
  //
  function receivedMessage (event) {

  }

  //
  // Handle game_play (when player closes game) events here.
  //
  function receivedGameplay (event) {
    // Page-scoped ID of the bot user
    var senderId = event.sender.id;

    // FBInstant player ID:  event.game_play.player_id
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
function sendMessage1(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

//bot messages

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

  function callSendAPI (messageData) {
    var graphApiUrl = 'https://graph.facebook.com/me/messages?access_token=' + process.env.PAGE_ACCESS_TOKEN;
    request({
      url: graphApiUrl,
      method: 'POST',
      json: true,
      body: messageData
    }, function (error, response, body) {
      console.error(
        'Send api returned error', error,
        'Status code', response.statusCode,
        'Body', body
      );
    });
  }

require('./matches.js')(app);
