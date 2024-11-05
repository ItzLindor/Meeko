
const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	on: true,
	execute(message) {

    console.log(`New Message in ${message.channel}`);
    if (message.content === '!hello') {
        message.channel.send(`Hello, ${message.author.username}!`);
    } else if (message.content === '!help') {
        message.channel.send('Available commands: !ping, !hello, !help, !dabtime');
    }
    else if (message.content === '!dabtime') {
        message.channel.send("IT'S TIME FOR A FAT DAB");
    }
}}
