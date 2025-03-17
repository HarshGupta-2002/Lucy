const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js')
const logger = require('../../utility/logger')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Restrict user from sending messages')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration of timeout (in hrs)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for mute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Ensures only users with suitable permissions can use it

    async execute(interaction) {
        const target = interaction.options.getUser('target')
        const duration = interaction.options.getInteger('duration') || 'Indefinite'
        const reason = interaction.options.getString('reason') || 'No reason provided'

        const member = await interaction.guild.members.fetch(target.id).catch(() => null)
        const scope = await interaction.guild.members.fetchMe().catch(() => null)

        if (!member) {
            return interaction.reply({ content: 'User is not in the server', flags: MessageFlags.Ephemeral })
        }
        if (!scope.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'I do not have permission to timeout members', flags: MessageFlags.Ephemeral })
        }

        // Deny the SEND_MESSAGES permission in all text channels
        const textChannels = interaction.guild.channels.cache.filter(channel => channel.isTextBased())
        let alreadyTimedOut = true

        for (const channel of textChannels.values()) {
            const permission = channel.permissionOverwrites.cache.get(member.id)
            if (permission && permission.deny.has(PermissionFlagsBits.SendMessages)) { continue }
            else { alreadyTimedOut = false }
        }

        if (alreadyTimedOut) {
            return interaction.reply({ content: `${target.tag} is already timed out from all channels`, flags: MessageFlags.Ephemeral })
        }

        for (const channel of textChannels.values()) {
            await channel.permissionOverwrites.edit(member.id, { [PermissionFlagsBits.SendMessages]: false }, { reason })
        }
        logger.debug(`${target.tag} timed out from all channels`, interaction.guild)

        await interaction.reply({ content: `${target.tag} has been timed out. Duration: ${duration} hrs. Reason: ${reason}` })
        logger.info(`${target.tag} has been timed out from the server. Duration: ${duration} hrs. Reason: ${reason}`, interaction.guild)

        // If duration is provided, set a timeout to revert the permission after the specified duration
        if (duration) {
            const durationInMs = duration * 60 * 60 * 1000 // Convert hours to milliseconds
            if (durationInMs > 0) {
                setTimeout(async () => {
                    for (const channel of textChannels.values()) {
                        const permission = channel.permissionOverwrites.cache.get(member.id)
                        if (permission && permission.deny.has(PermissionFlagsBits.SendMessages)) {
                            await channel.permissionOverwrites.edit(member.id, { [PermissionFlagsBits.SendMessages]: true }, { reason: 'Timeout expired' })
                        }
                    }
                    await interaction.followUp({ content: `${target.tag}'s timeout has expired and they can now send messages again.` })
                    logger.info(`${target.tag}'s timeout has expired`, interaction.guild)
                }, durationInMs)
            }
        }
    },
}