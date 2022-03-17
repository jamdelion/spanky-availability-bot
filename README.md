# Spanky Slack bot

### How to use

1. Configure a slack app and opulate the .env (see .env.example) with the tokens.

2. `npm install` and run the server (`node server.js`)

3. Run ngrok (`./ngrok http 3000`) in a separate terminal, and use the forwarding URL in the the interactivity and slash commands settings of the slack app:

- Request URL and Options Load URL:
`<ngrok URL>/slack/actions`


- Slash commands Request URL:
`<ngrok URL>/slack/commands`

4. Install in workspace and invoke with `/availablity <string>`