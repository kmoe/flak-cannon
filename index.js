const fp = require('lodash/fp');
const request = require('request');
const Twitter = require('twitter');
const TwilioClient = require('twilio');

// capabilities
const defaults = {
  slack: {
    enabled: false,
    webhook_url: null,
  },
  twitter: {
    enabled: false,
    consumer_key: null,
    consumer_secret: null,
    access_token_key: null,
    access_token_secret: null,
  },
  telegram: { // DOESN'T WORK LOL
    enabled: false,
    token: null,
  },
  twilio: {
    enabled: false,
    outbound_number: null,
    inbound_number: null,
    account_sid: null,
    auth_token: null,
  }
};

const FlakCannon = function(options) {
  this.options = fp.defaultsDeep(defaults, options);
};

FlakCannon.prototype.spray = function(options, message) {
  this.options = fp.defaultsDeep(this.options, options);

  if (this.options.slack.enabled) {
    const slackOptions= this.options.slack;

    request.post({
      url: slackOptions.webhook_url,
      json: true,
      body: {
        text: message
      },
    }, function(err) {
      console.error(err);
    });
  }

  if (this.options.telegram.enabled) {
    const telegramOptions = this.options.telegram;

    request.post({
      url: `https://api.telegram.org/${telegramOptions.token}/sendMessage`,
      json: true,
      body: {
        text: message
      }
    });
  }

  if (this.options.twitter.enabled) {
    const twitterOptions = this.options.twitter;

    const client = new Twitter({
      consumer_key: twitterOptions.consumer_key,
      consumer_secret: twitterOptions.consumer_secret,
      access_token_key: twitterOptions.access_token_key,
      access_token_secret: twitterOptions.access_token_secret,
    });

    client.post('statuses/update', {status: message}, function(error, tweet, response){
      if (error) {
        console.error(error);
      } else {
        console.log(tweet);
      }
    });
  }
  
  if (this.options.twilio.enabled) {
    const twilioOptions = this.options.twilio;

    const twilioClient = TwilioClient(twilioOptions.account_sid, twilioOptions.auth_token);

    twilioClient.messages.create({
      to: twilioOptions.inbound_number,
      from: twilioOptions.outbound_number,
      body: message,
    }, (error, msg) => {
      if (error) {
        console.error({
          error: error
        });
      }
      console.log('Twilio message sent: ' + msg.sid);
    });
  }

  

  console.log('SPRAY');
};

module.exports = FlakCannon;