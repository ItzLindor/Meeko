const { Events } = require('discord.js');
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { roleMappings } = require('../commands/utility/createreactroles.js')

module.exports = {
	name: Events.MessageReactionRemove,
	on: true,
	async execute(reaction, user) {
        if (user.bot) return; // Ignore bot reactions

        console.log(`Removing reaction from ${user}`);

    const { message, emoji } = reaction;
    const emojiRoleMapping = roleMappings.get(message.id);
    if (!emojiRoleMapping) return;

    const roleId = emojiRoleMapping[emoji.name];
    if (!roleId) return;

    const member = await message.guild.members.fetch(user.id);

    // if (!member.guild.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
    //     console.log("Bot lacks permissions to manage roles");
    //     return;
    // }

    try {
        await member.roles.remove(roleId);
        console.log(`Removed role from ${member.user.tag} for removing reaction ${emoji.name}`);
    } catch (error) {
        console.error(`Failed to remove role:`, error);
    }
    }
}