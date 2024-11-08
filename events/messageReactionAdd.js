const { Events } = require('discord.js');
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { roleMappings } = require('../commands/utility/createreactroles.js')

module.exports = {
	name: Events.MessageReactionAdd,
	on: true,
	async execute(reaction, user) {
        if (user.bot) return; // Ignore bot reactions

        const { message, emoji } = reaction;
    
        // Check if the message ID is one we are tracking
        const emojiRoleMapping = roleMappings.get(message.id);
        if (!emojiRoleMapping) return;
    
        // Check if the emoji is one that we assigned to a role
        const roleId = emojiRoleMapping[emoji.name];
        if (!roleId) return;
    
        // Get the member who reacted
        const member = await message.guild.members.fetch(user.id);
    
        // Ensure the bot has permission to manage roles
        // if (!member.guild.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        //     console.log("Bot lacks permissions to manage roles");
        //     return;
        // }
    
        // Assign the role to the member
        try {
            await member.roles.add(roleId);
            console.log(`Assigned role to ${member.user.tag} for reacting with ${emoji.name}`);
        } catch (error) {
            console.error(`Failed to assign role:`, error);
        }
    }
}