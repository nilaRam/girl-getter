const { App } = require("@slack/bolt")
require("dotenv").config()

var Airtable = require('airtable');
var base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base('appXRP0N9QAg3XrcM');

const channels = [{ id: "C75M7C0SY", name: "welcome" }, { id: "C01504DCLVD", name: "scrapbook" }, { id: "C0M8PUPU6", name: "ship" }, { id: "C03K25PAA15", name: "test" }];

const app = new App(
    {
        token: process.env.SLACK_BOT_TOKEN,
        appToken: process.env.SLACK_APP_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        socketMode: true
    }
);

app.message(/[\s\S]*/, async ({ message, client }) => {
    if (!channels.some(c => c.id === message.channel)) return;

    const user = await client.users.profile.get({ user: message.user });
    const channel = channels.find(c => c.id === message.channel);

    if (user.profile.fields["XfD4V9MG3V"].value.startsWith("he/")) return;

    await client.chat.postMessage({
        channel: "U01FAVARYH1",
        text: `Hi Nila, got you a girl! \n Here is the link: https://hackclub.slack.com/archives/${message.channel}/p${message.ts.replace(".", "")}`,
    })


    base('Table 1').select({
        maxRecords: 1, filterByFormula: `slackId = "${message.user}"`,
    }).eachPage((records) => {
        try {
            if (records.length > 0) {
                base('Table 1').update([
                    {
                        "id": records[0].getId(),
                        fields: {
                            welcome: channel.name === "welcome" ? true : records[0].fields.welcome,
                            scrapbook: channel.name === "test" ? true : records[0].fields.scrapbook,
                            ship: channel.name === "ship" ? true : records[0].fields.ship,
                        }
                    },
                ]);
            } else {
                base('Table 1').create([
                    {
                        "fields": {
                            "slackId": message.user,
                            "name": user.profile.display_name,
                            "welcome": channel.name === "welcome",
                            "scrapbook": channel.name === "scrapbook",
                            "ship": channel.name === "ship",
                            "date": new Date().toISOString(),
                        }
                    },
                ]);
            }
        } catch (err) {
            console.log('error inside each page ==> ', e)
        }
    });
});

async function main() {
    await app.start(process.env.PORT || 3000);
    console.log("Bolt app is running!");
}

main();
