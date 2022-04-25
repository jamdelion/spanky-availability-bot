# Spanky Slack bot

<img src="https://user-images.githubusercontent.com/31373245/164750318-a438fbe0-1eb7-4cf4-abf8-d17b6774c2c7.png" width="300" />

### How to use

1. Configure a slack app and populate the .env (see .env.example) with the tokens.

2. `npm install` and run the server (`node server.js`)

3. Run ngrok (`./ngrok http 3000`) in a separate terminal, and use the forwarding URL in the the interactivity, events subscription and slash commands settings of the slack app:

E.g. 

- Request URL and Options Load URL:
`<ngrok URL>/slack/actions`

- Slash commands Request URL:
`<ngrok URL>/slack/commands`

- Event subscriptions URL:
`<ngrok URL>/events`

4. Install in workspace and invoke with `/availablity <@user> for <string>`

### Stretch tasks

- [ ] Send Jo an automatic reminder to re-ask people who said maybe
- [X] Find a way to have this permanently running (now on Heroku)
- [ ] Ask multiple people with one command
### Useful resources

- https://github.com/fac21/final-project-telegran/blob/main/server/api/sendToSlack.js
- https://glitch.com/edit/#!/victorious-colossal-hamburger?path=server.js%3A242%3A0
- https://api.slack.com/interactivity/slash-commands
- https://github.com/slackapi/sample-message-menus-node
- https://github.com/slackapi/node-slack-sdk
- https://api.slack.com/reference/block-kit/block-elements#button
