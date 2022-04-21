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

// Handle interactions from messages with a `callback_id` of `availability`
slackInteractions.action("availability", (payload, respond) => {
  switch (payload.actions[0].value) {
    case 'available':
      console.log("payload", payload);
      return "Excellent, see you there!"
      break;
    case 'busy':
      console.log("payload", payload);
      return "Ok, thanks for letting me know."
      break;
    case 'maybe':
      console.log("payload", payload);
      // remind Jo to ask {payload.user.name} again next week
      // store "maybe" value against {payload.user.name} for {payload.original_message.text}
      return "Ok, I'll ask you again next week."
      break;
    default:
      console.log(`Went to default option`);
  }
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
