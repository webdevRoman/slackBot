# Test task for traineeship in the company Standuply

## Instruction how to test that application
1. Make sure that you have node js installed on your computer.

2. Sign in your slack channel.

3. Go to https://api.slack.com/apps and click “Create an App”. Insert app name and choose workspace for it.

4. Create a bot user. You should click on one of the buttons shown on the picture below and add the bot user there.
  <img align="center" src="https://github.com/webdevRoman/slackbot/blob/descr/1.jpg" alt="Button 'Bot Users' in menu or 'Bots' in 'Add features and functionality' section">

5. Go back to “Basic information” and install app to workspace.
  <img align="center" src="https://github.com/webdevRoman/slackbot/blob/descr/2.jpg" alt="1. Basic Information. 2. Install App to Workspace">

6. Download Git repository as ZIP (https://github.com/webdevRoman/slackbot) and unzip it.

7. In the file index.js change field “token” (8th line in the file).
  <img align="center" src="https://github.com/webdevRoman/slackbot/blob/descr/3.jpg" alt="9-11 lines in index.js">
  You can find this key on the page “OAuth & Permissions”.
  <img align="center" src="https://github.com/webdevRoman/slackbot/blob/descr/5.jpg" alt="Bot User Oauth Access Token on OAuth & Permissions">
  Save the file.

8. Open Terminal in unzipped catalogue.
  Write `npm install` and wait until the installation would be over.
  Next terminal command is `node db`. It will create a database. After that press Ctrl+C.

9. Start local server with the command `npm run start`. You are great! Now bot is ready to be tested.
  To make an order send him message that looks like `@(botname) заказ`. Then follow bot’s instructions.

10. To test SPA visit website using the link that you got in the Terminal after you started local server (it should be http://localhost:4390).

11. To stop testing stop Terminal (Ctrl+C).
