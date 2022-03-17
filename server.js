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

server.use(bodyParser.urlencoded({ extended: false }));
server.use("/slack/actions", slackInteractions.expressMiddleware());

server.get("/", (req, res) => {
  res.send("<h1>Server is running</h1>");
});

// Attach the slash command handler
server.post("/slack/commands", slackSlashCommand);

// Handle interactions from messages with a `callback_id` of `welcome_button`
slackInteractions.action("welcome_button", (payload, respond) => {
  // `payload` contains information about the action
  // see: https://api.slack.com/docs/interactive-message-field-guide#action_url_invocation_payload
  console.log(payload);

  // `respond` is a function that can be used to follow up on the action with a message
  respond({
    text: "Success!",
  });

  // The return value is used to update the message where the action occurred immediately.
  // Use this to items like buttons and menus that you only want a user to interact with once.
  return {
    text: "Processing...",
  };
});

function slackSlashCommand(req, res, next) {
  console.log("in slackSlashCommand");
  console.log("req.body", req.body);
  console.log("res.body", res.req.body);
  console.log("slackVet", slackVerificationToken);
  console.log("res body token", req.body.token);
  console.log("equal", req.body.token === slackVerificationToken);
  if (
    req.body.token === slackVerificationToken &&
    req.body.command === "/availability"
  ) {
    console.log("about to do res.json");
    res.json({ ...interactiveButtons, text: req.body.text });
  } else {
    next();
  }
}

slackInteractions.action("availability", (payload, respond) => {
  console.log("payload", payload);
  console.log("respond", respond);
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
