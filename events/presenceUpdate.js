const { Events } = require('discord.js');
const streamingMessages = new Map(); // Store messages by user ID


module.exports = {
	name: Events.PresenceUpdate,
	on: true,
	execute(oldPresence, newPresence) {
        if (oldPresence === null) {
            console.log(`Presence Update was null!`);
            try {console.log(` new member update ${newPresence.user}`)}
            catch{}
        } else {
        console.log(`${oldPresence.user} updated their status`)
        }




       if (!newPresence) return;

    const isStreaming = newPresence.activities.some(activity => activity.type === 'STREAMING');
    const userId = newPresence.user.id; // Get user ID

    // Check if the user started streaming
    if (isStreaming && (!oldPresence || !oldPresence.activities.some(activity => activity.type === 'STREAMING'))) {
        console.log(`${newPresence.user.tag} has started streaming: ${newPresence.activities.find(activity => activity.type === 'STREAMING').name}`);
        
        const streamUrl = newPresence.activities.find(activity => activity.type === 'STREAMING').url; // Get streaming URL
        
        // Extract the username from the URL
        const username = streamUrl.split('twitch.tv/')[1]; // Get everything after 'twitch.tv/'

        const generalChannel = newPresence.guild.channels.cache.find(channel => channel.name === 'general');
        
        if (generalChannel) {
            generalChannel.send(`${newPresence.user.tag} is now streaming! Check it out here: ${streamUrl}`)
                .then(message => {
                    userStreamingData.set(userId, { message, url: username }); // Store message and username
                })
                .catch(err => console.error('Failed to send message:', err));
        } else {
            console.log('General channel not found!');
        }
    } 
    // Check if the user has stopped streaming
    else if (oldPresence && oldPresence.activities.some(activity => activity.type === 'STREAMING') && !isStreaming) {
        console.log(`${newPresence.user.tag} has stopped streaming.`);
        userStreamingData.set(userId, { message: null, url: null }); // Mark the user as needing to check their streaming status
    }



    }}