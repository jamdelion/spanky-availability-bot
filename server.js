const express = require("express");
const bodyParser = require("body-parser");
const { createMessageAdapter } = require("@slack/interactive-messages");
const { WebClient } = require("@slack/web-api");
const { interactiveButtons } = require("./interactiveButtons");
const dotenv = require("dotenv");

dotenv.config();

const client = new WebClient(process.env.SLACK_BOT_TOKEN);
const server = express();
const slackAccessToken = process.env.SLACK_BOT_TOKEN;

const slackInteractions = createMessageAdapter(
  process.env.SLACK_SIGNING_SECRET
);
const slackVerificationToken = process.env.SLACK_VERIFICATION_TOKEN;
const PORT = process.env.PORT || 3000;

if (!slackVerificationToken || !slackAccessToken) {
  throw new Error(
    "Slack verification token and access token are required to run this app."
  );
}

// can define body parser twice, one each for urlencoded and json
// e.g.
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// server.post(bodyParser.urlencoded({ extended: false }), slackSlashCommand);
server.use("/slack/actions", slackInteractions.expressMiddleware());

server.get("/", (req, res) => {
  res.send("<h1>Server is running</h1>");
});

// Attach the slash command handler
server.post("/slack/commands", bodyParser.urlencoded({extended: false}), slackSlashCommand);

function slackSlashCommand(req, res, next) {
  console.log("in slackSlashCommand");
  console.log("req.body", req.body);
  console.log("res.body", res.req.body);
  if (
    req.body.token === slackVerificationToken &&
    req.body.command === "/availability"
  ) {
    res.json({ ...interactiveButtons, text: req.body.text });
  } else {
    next();
  }
}

// test that the slack bot can listen at the events endpoint
server.post("/events", bodyParser.json(), (req, res) => {
  console.log("req events", req.body)
  console.log("res events", res.body)
  res.send(req.body.challenge);
});


// Handle interactions from messages with a `callback_id` of `availability`
slackInteractions.action("availability", (payload, respond) => {

  console.log("payload", payload);

  const user = payload.user.name;
  const gig = payload.original_message.text;
  const availability = payload.actions[0].value;

  tellJo(user, gig, availability);

  switch (availability) {
    case 'available':
      return "Excellent, see you there!"
      break;
    case 'busy':
      return "Ok, thanks for letting me know."
      break;
    case 'maybe':
      // remind Jo to ask {payload.user.name} again next week
      return "Ok, I'll ask you again next week."
      break;
    default:
      console.log(`Went to default option`);
  }
});

async function tellJo(person, gig, answer) {

  // This is the same as:
  //   POST https://slack.com/api/chat.postMessage
  // Content-type: application/json
  // Authorization: Bearer xoxb-your-token
  // {
  //   "channel": "YOUR_CHANNEL_ID",
  //   "text": "Hello world :tada:"
  // }

  try {
    const result = await client.chat.postMessage({
      token: slackAccessToken,
      channel: 'U0257P9V8TH', // Jo's member id
      text: `For ${gig}, ${person}'s answer is ${answer}`
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
}

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
