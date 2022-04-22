# Spanky Slack bot

### How to use

1. Configure a slack app and opulate the .env (see .env.example) with the tokens.

2. `npm install` and run the server (`node server.js`)

3. Run ngrok (`./ngrok http 3000`) in a separate terminal, and use the forwarding URL in the the interactivity and slash commands settings of the slack app:

- Request URL and Options Load URL:
`<ngrok URL>/slack/actions`


- Slash commands Request URL:
`<ngrok URL>/slack/commands`

4. Install in workspace and invoke with `/availablity <@user> for <string>`

### Stretch tasks

- [ ] Send Jo an automatic reminder to re-ask people who said maybe
- [ ] Find a way to have this permanently running
- [ ] Ask multiple people with one command
### Useful resources

- https://github.com/fac21/final-project-telegran/blob/main/server/api/sendToSlack.js
- https://glitch.com/edit/#!/victorious-colossal-hamburger?path=server.js%3A242%3A0
- https://api.slack.com/interactivity/slash-commands
- https://github.com/slackapi/sample-message-menus-node
- https://github.com/slackapi/node-slack-sdk
- https://api.slack.com/reference/block-kit/block-elements#button
