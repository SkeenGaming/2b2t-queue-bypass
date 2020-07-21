// to make sure webserver works correctly
process.chdir("2bored2wait/")

// reqs
var http = require("http");
var queuing = require('./2bored2wait/main.js');
var auth = require('./auth.json');
var sleep = require('sleep');
var Discord = require('discord.js');

global.queueData = "";

var client = new Discord.Client()

function update() {
    http.get("http://localhost/update", (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on("end", () => {
            queueData = JSON.parse(data);
            console.log(`Recieved data: ${queueData.place}`)
            if (queueData.place === "None" || queueData.place === "undefined") {
                queueData = "Please allow a moment for the data to update"
            }
        });
    }).on("error", (err) => {
        queueData = "error"
    });
    setTimeout(update, 5 * 1000);
    setTimeout(timedDiscordUpdate, 30 * 1000);
}

function setDiscordActivity(string) {
    client.user.setActivity(string, {
            type: ""
        })
        .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(console.error);
}

function timedDiscordUpdate() {
    setDiscordActivity("Queue Position: " + queueData.place)
    var numberplace = parseInt(queueData.place, 10)
    if (numberplace <=20) {
        client.channels.get("734879499203772429").send({
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                fields: [{
                    name: "CRITICAL QUEUE UPDATE",
                    value: "Place in queue has reached 20, log on now. @everyone"
                }
            ],
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avaterURL,
                text: "Author: Nateweav"
            }
            }
        })
    }
}
// Configure logger settings


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    setDiscordActivity("Not queueing.")
})

client.on('message', msg => {

    if (msg.content === 'update') {
        msg.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                title: "2b2t Queue Details",
                //url: "http://google.com",
                description: "Start and stop the queue from discord!",
                fields: [{
                        name: "Position",
                        value: `You are in position **${queueData.place}**.`
                    },
                    {
                        name: "ETA",
                        value: `Estimated time until login: **${queueData.ETA}**`
                    }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "Author: NateWeav"
                }
            }
        });
    }
    if (msg.content === "start") {
        http.get("http://localhost/start")
        msg.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                fields: [{
                        name: "Queue",
                        value: `Queue is starting up. Allow 15 seconds to update.`
                    }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "Author: NateWeav"
                }
            }
        });
        setDiscordActivity("Starting queue.")
        setTimeout(update, 5 * 1000);
    }
    if (msg.content === "stop") {
        http.get("http://localhost/stop")
        setDiscordActivity("Not queueing.")
        msg.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                fields: [{
                        name: "Queue",
                        value: `Queue is **stopped**.`
                    }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "Author: NateWeav"
                }
            }
        });
    }
    var numberplace = parseInt(queueData.place, 10)
    if (numberplace <= 553) {
        msg.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name : client.user.username,
                    icon_url : client.user.avatarURL
                },
                fields: [{
                    name: "CRITICAL QUEUE UPDATE",
                    value: "Place in queue has reached 20, log on now. @everyone"
                }
            ],
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: "Author: NateWeav"
            }
            }
        })
    }
    
})


client.login(auth.token)
