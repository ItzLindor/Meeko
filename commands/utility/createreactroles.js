const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

// In-memory storage for message-to-role mappings (for simplicity)
const roleMappings = new Map();

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
       // console.log(interaction);
        const messageId = interaction.options.getString('messageid');
        const roleCount = interaction.options.getInteger('rolecount');
        const roleNames = interaction.options.getString('rolenames').split(',').map(role => role.trim());

        // Check if role count matches the number of role names
        if (roleCount !== roleNames.length) {
            return interaction.reply({ content: 'The number of roles does not match the role count specified.', ephemeral: true });
        }

        const maxReactions = 4;
        if (roleCount > maxReactions) {
            return interaction.reply({ content: `You can only add up to ${maxReactions} roles.`, ephemeral: true });
        }

        const channel = interaction.channel;
        const targetMessage = await channel.messages.fetch(messageId);
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
        roleMappings.set(messageId, emojiRoleMapping);

        await interaction.reply({ content: 'Roles created and reactions added for role assignment!' });
    },
};

// Export the roleMappings so it can be used in other files
module.exports.roleMappings = roleMappings;