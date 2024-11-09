const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
require('dotenv').config()

// In-memory storage for message-to-role mappings (for simplicity)
const roleMappings = new Map();

// Load existing data from the REACTROLE_DATA environment variable
let savedRoleMappings = {};
if (process.env.REACTROLE_DATA) {
    try {
        //console.log(JSON.parse(process.env.REACTROLE_DATA));
        savedRoleMappings = JSON.parse(process.env.REACTROLE_DATA);
    } catch (error) {
        console.error("Failed to parse REACTROLE_DATA:", error);
    }
}

// Sync saved mappings into roleMappings Map for usage
for (const [messageID, data] of Object.entries(savedRoleMappings)) {
    roleMappings.set(messageID, data);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactrole')
        .setDescription('Creates roles and adds reactions for role assignment')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('The ID of the message to add reactions to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('rolecount')
                .setDescription('The number of roles to create reactions for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rolenames')
                .setDescription('Comma-separated list of role names')
                .setRequired(true)),

    async execute(interaction) {
        const messageID = interaction.options.getString('messageid');
        const roleCount = interaction.options.getInteger('rolecount');
        const roleNames = interaction.options.getString('rolenames').split(',').map(name => name.trim());

        if (roleNames.length !== roleCount) {
            return interaction.reply({ content: "Number of roles does not match the role names provided.", ephemeral: true });
        }

        const adminRole = interaction.guild.roles.cache.find(role => role.name === 'Admin');
        const member = interaction.guild.members.cache.get(interaction.user.id);

        if (!adminRole || !member.roles.cache.has(adminRole.id)) {
            return interaction.reply({ 
                content: 'You do not have permission to use this command.', 
                ephemeral: true 
            });
        }

        const maxReactions = 4;
        if (roleCount > maxReactions) {
            return interaction.reply({ content: `You can only add up to ${maxReactions} roles.`, ephemeral: true });
        }

        const channel = interaction.channel;
        const targetMessage = await channel.messages.fetch(messageID);
        if (!targetMessage) {
            return interaction.reply({ content: 'Message not found. Please provide a valid message ID.', ephemeral: true });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const emojis = ['👍', '👎', '😊', '😎']; // Adjust or expand as needed
        const emojiRoleMapping = {};

        for (let i = 0; i < roleCount; i++) {
            const roleName = roleNames[i];
            let role = interaction.guild.roles.cache.find(r => r.name === roleName);

            if (!role) {
                try {
                    role = await interaction.guild.roles.create({
                        name: roleName,
                        mentionable: true,
                    });
                } catch (error) {
                    console.error(`Failed to create role: ${roleName}`, error);
                    return interaction.reply({ content: `Failed to create the role ${roleName}.`, ephemeral: true });
                }
            }

            emojiRoleMapping[emojis[i]] = role.id;
            await targetMessage.react(emojis[i]);
        }

        // Store the mapping so it can be accessed by the reaction handler
        roleMappings.set(messageID, emojiRoleMapping);

        // Save data to the environment variable
        savedRoleMappings[messageID] = { roleCount, roleNames };
        process.env.REACTROLE_DATA = JSON.stringify(savedRoleMappings);

        console.log(JSON.parse(process.env.REACTROLE_DATA));
        //process.env.REACTROLE_DATA = (savedRoleMappings);
        

        await interaction.reply({ content: 'Roles created and reactions added for role assignment!' });
    },
};

// Export the roleMappings so it can be used in other files
module.exports.roleMappings = roleMappings;