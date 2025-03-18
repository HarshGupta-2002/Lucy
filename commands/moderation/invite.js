const { SlashCommandBuilder, MessageFlags } = require('discord.js')
const logger = require('../../utility/logger')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite user to server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to send invite to')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target')

        if (!target) {
            return interaction.reply({ content: 'Please enter a valid user', flags: MessageFlags.Ephemeral })
        }
        
        const invite = await interaction.guild.invites.create(interaction.guild.id, {
            maxAge: 0, // Infinite expiration
            maxUses: 1, // One-time use link
            unique: true, // Link is unique
        }).catch((err) => {
            logger.error('Error creating invite:', err, interaction.guild)
            return interaction.reply({ content: 'Could not generate the invite link', flags: MessageFlags.Ephemeral })
        })

        // Send the invite link to the target user
        await target.send(`Hello! You've been invited to join ${interaction.guild.name}. Here's your invite link: ${invite.url}`)
        await interaction.reply({ content: `Invite sent to ${target.tag}` })
        logger.info(`Invite link sent to ${target.tag} for server: ${interaction.guild.name}`, interaction.guild)
    },
}