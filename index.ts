import DiscordJS, { ActivityPlatform, Guild } from "discord.js";
import 'dotenv/config'
import express from "express";
import { isKickLive } from "./apiChecks"

const app = express();
const PORT = process.env.PORT || 3000;

const streamers: { [key: string]: { username: string; platform: string; live: boolean; member: DiscordJS.GuildMember} } = {};

app.use(express.json());

app.get("/", (req, res) => {
    //count the number of streamers
    const streamerCount = Object.keys(streamers).length;
    const streamerTable = Object.keys(streamers).map(key => {
        const streamer = streamers[key];
        return `<tr><td>${key}</td><td>${streamer.username}</td><td>${streamer.platform}</td><td>${streamer.live}</td></tr>`;
    });
    res.send(`
    <html>
    <head>
        <title>Discord Live Bot</title>
    </head>
    <body>
        <p>Discord Live Bot, tracking ${streamerCount} streamers</p>
        <table>
            ${streamerTable}
        </table>
    </body>
    </html>
`);
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

const client = new DiscordJS.Client({
    intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"],
});

function addStreamer(discordUsername: string, platformUsername: string, platform: string, member: DiscordJS.GuildMember) {
    console.log(`${discordUsername} || ${platformUsername} || ${platform}`);
    streamers[discordUsername] = {
        username: platformUsername || "",
        platform,
        live: false,
        member: member
    };
}

client.on("ready", () => {
    console.log("Live Role bot ready");
    const guildId = process.env.GUILD_ID || "";

    const guild = client.guilds.cache.get(guildId);

    const kickRole = guild?.roles.cache.find(role => role.id === process.env.KICKLIVE_ROLE || "") || "";

    console.log('Connected to server: ' + guild?.name)

    //loop messages from thread
    const thread = guild?.channels.cache.get(process.env.THREAD_ID || "") as DiscordJS.ThreadChannel;
    thread.messages.fetch().then(messages => {
        messages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        messages.forEach(message => {
            
            if (message.content.includes("kick.com")) {
                //regex to get the username kick.com/username
                const platformUsername = message.content.match(/(?<=kick.com\/).*/g)|| "";
                //get member from message
                const member = guild?.members.fetch(message.author.id).then(member => {
                    addStreamer(message.author.username.toString(), platformUsername.toString(), "kick.com", member);
                }
                )

    }
        })

    if (kickRole)
    {
        //check every 10 minutes
    setInterval(checkStreamers(false, kickRole), 6000/*00*/ ); // Check for non-live streamers every 10 minutes
    setInterval(checkStreamers(true, kickRole), 3000/*00*/);  // Check for still live every 5 minutes
    }
});
});

client.on("messageCreate", message => {
    if (message.content.includes("kick.com")) {
        //regex to get the username kick.com/username
        const platformUsername = message.content.match(/(?<=kick.com\/).*/g)|| "";
     addStreamer(message.author.username.toString(), platformUsername.toString(), "kick.com", message.member as DiscordJS.GuildMember);
        }
});

function checkStreamers(isLive: boolean, role: DiscordJS.Role) {
    return () => {
        
        Object.keys(streamers).forEach(key => {
            const streamer = streamers[key];
            if (streamer.live === isLive) {
                console.log(`Checking if ${streamer.username} is ${isLive ? "still live" : "now live"} on ${streamer.platform}`);
                isKickLive(streamer.username, streamer.platform).then((live: any) => {
                    //set live to true if live
                    if (streamer.member) {
                        
                        if (live.isLive && live.title.toLowerCase().includes("kudos")) {
                            streamer.live = true;
                            // Add role with ID process.env.KICKLIVE_ROLE
                          streamer.member.roles.add(role);
                        } else {
                            streamer.live = false;
                            // Remove role if not live
                          streamer.member.roles.remove(role);
                        }
                    } else {
                        console.log(`Member not found for ${streamer.username}`);
                    }
                    
                });
            }
        });
    };
}




client.login(process.env.BOT_TOKEN);