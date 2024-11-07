const { Events, PermissionsBitField, ChannelType } = require('discord.js');

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

        // Ensure member caches are populated and initial update when bot starts
        for (const guild of client.guilds.cache.values()) {
            await updateMemberCountChannel(guild);
        }

        // Update on member join and leave events
        client.on('guildMemberAdd', member => updateMemberCountChannel(member.guild));
        client.on('guildMemberRemove', member => updateMemberCountChannel(member.guild));
    },
};
