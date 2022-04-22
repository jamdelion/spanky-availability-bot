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

const userIds = {
  JO: process.env.JO_USER_ID,
  FINGAL: process.env.FINGAL_USER_ID,
}

// can define body parser twice, one each for urlencoded and json
// e.g.
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

server.use("/slack/actions", slackInteractions.expressMiddleware());

// Attach the slash command handler
server.post("/slack/commands", bodyParser.urlencoded({extended: false}), slackSlashCommand);

async function slackSlashCommand(req, res, next) {
  if (
    req.body.token === slackVerificationToken &&
    req.body.command === "/availability"
  ) {
    const {userToAsk, gigDetails} = parseSlashCommand(req.body.text)
    askQuestion(userToAsk, gigDetails)
    res.send(gigDetails) // send confirmation to user who called command
  } else {
    next();
  }
}

function parseSlashCommand(commandText) {
  // split into an array containing the username and gig details string
  const [userToAsk, gigDetails] = commandText.split("for").map(x => x.trim());
  return {userToAsk, gigDetails}
}

// test that the slack bot can listen at the events endpoint
server.post("/events", bodyParser.json(), (req, res) => {
  res.send(req.body.challenge);
});


// Handle interactions from messages with a `callback_id` of `availability`
slackInteractions.action("availability", (payload, respond) => {

  const user = payload.user.name;
  const gig = payload.original_message.text;
  const availability = payload.actions[0].value;

  tellJo(user, gig, availability);

  switch (availability) {
    case 'available':
      return `:star: Excellent, you've said you're available for "${gig}". Thanks for replying, and see you there! :guitar: :saxophone:`
      break;
    case 'busy':
      return `Ok, you've said you're not available for "${gig}". Thanks for letting me know. :+1:`
      break;
    case 'maybe':
      // remind Jo to ask {payload.user.name} again next week
      return `You've said "maybe" for "${gig}". I'll ask you again next week. :arrows_counterclockwise:`
      break;
    default:
      console.log(`Went to default option`);
  }
});

async function getOrgUsers() {
  try {
    const result = await client.users.list({
      token: slackAccessToken
    });
    return result.members.map(user => pick(user, 'id', 'name', 'real_name'));
  }
  catch (error) {
    console.error(error);
  }
}

const pick = (obj, ...keys) => Object.fromEntries(
  keys
  .filter(key => key in obj)
  .map(key => [key, obj[key]])
);


// The slack bot opens a DM with the specified user to ask for their availability
async function askQuestion(userToAsk, gigDetails) {

  const userList = await getOrgUsers();

  const normalisedName = userToAsk.replace("@", "");

  const newUserToAsk = userList.filter(user => user.name === normalisedName);

  try {
    const result = await client.chat.postMessage({
      token: slackAccessToken,
      channel: newUserToAsk[0].id,
      ...interactiveButtons,
      text: gigDetails
    });
  }
  catch (error) {
    console.error(error);
  }
}

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
      channel: process.env.JO_USER_ID,
      text: `For ${gig}, ${person}'s answer is ${answer}`
    });
  }
  catch (error) {
    console.error(error);
  }
}

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
