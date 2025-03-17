const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js')
const logger = require('../../utility/logger')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-timeout')
        .setDescription('Allow user to send messages')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to remove timeout')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Ensures only users with suitable permissions can use it

    async execute(interaction) {
        const target = interaction.options.getUser('target')

        const member = await interaction.guild.members.fetch(target.id).catch(() => null)
        const scope = await interaction.guild.members.fetchMe().catch(() => null)

        if (!member) {
            return interaction.reply({ content: 'User is not in the server', flags: MessageFlags.Ephemeral })
        }
        if (!scope.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'I do not have permission to remove timeout', flags: MessageFlags.Ephemeral })
        }

         // Provide the SEND_MESSAGES permission in all text channels
		const textChannels = interaction.guild.channels.cache.filter(channel => channel.isTextBased())
        let removedTimedOut = true

        for (const channel of textChannels.values()) {
            const permission = channel.permissionOverwrites.cache.get(member.id)
            if (permission &&permission.allow.has(PermissionFlagsBits.SendMessages)) { continue }
            else { removedTimedOut = false }
        }

        if (removedTimedOut) {
            return interaction.reply({ content: `${target.tag} was never timed out from all channels`, flags: MessageFlags.Ephemeral })
        }

        for (const channel of textChannels.values()) {
			await channel.permissionOverwrites.edit(member.id, { [PermissionFlagsBits.SendMessages]: true })
        }
        logger.debug(`${target.tag} has been removed from timeout from all channels`, interaction.guild)

        await interaction.reply({ content: `${target.tag} has been removed from time out` })
        logger.info(`${target.tag} has been removed from time out from the server`, interaction.guild)
    },
}