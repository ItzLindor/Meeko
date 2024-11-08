const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config()
const deployCommands = require('./deploy-commands.js');


// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const token = process.env.token;



const axios = require('axios');
const userStreamingData = new Map(); // Store messages and streaming URLs by user ID





// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // Optional: if you need member details
        GatewayIntentBits.GuildMessageReactions, // Optional: if you need reaction handling
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildIntegrations,
        
    ]
});




client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
            console.log(command.data.name);
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
deployCommands();


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}





// Function to get OAuth token (simplified example)
async function getTwitchOAuthToken() {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: 'jv18zmsvly0ahxdytjyh4xyee04v8i', // Replace with your Twitch client ID
            client_secret: 'np5dqi31sut6orxstou69ek36ziqmq', // Replace with your Twitch client secret
            grant_type: 'client_credentials'
        }
    });
    return response.data.access_token;
}

// Function to check if a user is streaming on Twitch
async function getTwitchUserStreamStatus(userId, oauthToken) {
    try {
        const response = await axios.get(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
            headers: {
                'Client-ID': 'YOUR_TWITCH_CLIENT_ID', // Replace with your Twitch client ID
                'Authorization': `Bearer ${oauthToken}`
            }
        });
        return response.data.data.length > 0; // Returns true if the user is streaming
    } catch (error) {
        console.error('Error fetching Twitch user stream status:', error);
        return false; // On error, assume not streaming to avoid false positives
    }
}

// Function to check the streaming status of users
async function checkStreamingStatus() {
    console.log("Checking twitch status")
    const oauthToken = await getTwitchOAuthToken();

    for (const [userId, { message, url }] of userStreamingData.entries()) {
        const isStillStreaming = await getTwitchUserStreamStatus(userId, oauthToken);
        
        if (!isStillStreaming && message) {
            message.delete() // Delete the message
                .then(() => {
                    console.log(`Deleted streaming message for user ID: ${userId}`);
                })
                .catch(err => console.error('Failed to delete message:', err));
            userStreamingData.delete(userId); // Remove from the map
        } else if (isStillStreaming) {
            console.log(`User ID: ${userId} is still streaming.`);
        }
    }
}

const express = require('express');
const app = express();

const port = 8000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Periodically check streaming status every 5 minutes (300000 milliseconds)
setInterval(checkStreamingStatus, 30000);
console.log(token);
// Log in to Discord with your client's token
client.login(token);







