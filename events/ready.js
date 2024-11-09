const { Events, PermissionsBitField, ChannelType } = require('discord.js');
const { roleMappings } = require('../commands/utility/createreactroles.js'); // Adjust path if needed

const fs = require('fs');
const path = require('path');
require('dotenv').config();
//const client = require(`../index.js`)




// Function to load previous role mappings from the "reaction-roles" channel
const dataFilePath = path.join(__dirname, '../commands/utility/reactrole_data.json'); // Path to saved data file

// Load previous role mappings based on saved command data
async function loadPreviousRoleMappings() {
    console.log(`Loading previous role mappings`)
    if (!fs.existsSync(dataFilePath)) return;

    const savedRoleMappings = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    const channel = await client.channels.fetch('1303889818861834264'); // "reaction-roles" channel ID
    if (!channel) {
        console.log("Reaction roles channel not found.");
        return;
    }
    console.log("Reaction channel found");

    for (const [messageID, { roleCount, roleNames }] of Object.entries(savedRoleMappings)) {
        const message = await channel.messages.fetch(messageID).catch(console.error);
        if (!message) continue;

        const emojiRoleMapping = {};

        // Add reactions and populate `roleMappings`
        for (let i = 0; i < roleCount; i++) {
            const roleName = roleNames[i];
            const role = message.guild.roles.cache.find(r => r.name === roleName);
            const emoji = ['👍', '👎', '😊', '😎'][i]; // Customize emojis if needed
            if (role) {
                emojiRoleMapping[emoji] = role.id;
                await message.react(emoji);
            }
        }

        if (Object.keys(emojiRoleMapping).length > 0) {
            roleMappings.set(messageID, emojiRoleMapping);
        }
    }
    console.log(`Previous reaction roles loaded into roleMappings. \n ${roleMappings}`);

}

async function updateMemberCountChannel(guild) {
    // Fetch all members to ensure accurate count, especially when the bot first starts
    await guild.members.fetch();

    // Get the count of human (non-bot) members only
    const humanCount = guild.members.cache.filter(member => !member.user.bot).size;

    // Find an existing member count channel that starts with "members:"
    let memberCountChannel = guild.channels.cache.find(channel => channel.name.startsWith('members-'));

    if (memberCountChannel) {
        // If we have an existing channel, update its name with the current count
        if (memberCountChannel.name !== `members: ${humanCount}`) {
            await memberCountChannel.setName(`members: ${humanCount}`).catch(console.error);
        }
    } else {
        // If no "members:" channel is found, create one
        memberCountChannel = await guild.channels.create({
            name: `members: ${humanCount}`,
            type: ChannelType.GuildText, // Explicitly set as a text channel
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id, // @everyone role
                    deny: [PermissionsBitField.Flags.ViewChannel], // Deny view permission for everyone
                }
            ]
        });
    }
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        //await loadPreviousRoleMappings();
        
            console.log(`Loading previous role mappings`)
            if (!fs.existsSync(dataFilePath)) return;
        
            const savedRoleMappings = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
            const channel = await client.channels.fetch('1303889818861834264'); // "reaction-roles" channel ID
            if (!channel) {
                console.log("Reaction roles channel not found.");
                return;
            }
            console.log("Reaction channel found");
        
            for (const [messageID, { roleCount, roleNames }] of Object.entries(savedRoleMappings)) {
                const message = await channel.messages.fetch(messageID).catch(console.error);
                if (!message) continue;
        
                const emojiRoleMapping = {};
        
                // Add reactions and populate `roleMappings`
                for (let i = 0; i < roleCount; i++) {
                    const roleName = roleNames[i];
                    const role = message.guild.roles.cache.find(r => r.name === roleName);
                    const emoji = ['👍', '👎', '😊', '😎'][i]; // Customize emojis if needed
                    if (role) {
                        emojiRoleMapping[emoji] = role.id;
                        await message.react(emoji);
                    }
                }
        
                if (Object.keys(emojiRoleMapping).length > 0) {
                   await roleMappings.set(messageID, emojiRoleMapping);
                }
            }
            console.log(`Previous reaction roles loaded into roleMappings.`)
           // console.table(roleMappings);
        
        
        
















        // Ensure member caches are populated and initial update when bot starts
        for (const guild of client.guilds.cache.values()) {
            await updateMemberCountChannel(guild);
        }

        // Update on member join and leave events
        client.on('guildMemberAdd', member => updateMemberCountChannel(member.guild));
        client.on('guildMemberRemove', member => updateMemberCountChannel(member.guild));
    },
};
