const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js')
const logger = require('../../utility/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Mute user from server')
		.addUserOption(option =>
			option.setName('target')
				.setDescription('User to mute')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Reason for mute')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers), // Ensures only users with Mute permissions can use it

	async execute(interaction) {
		const target = interaction.options.getUser('target')
		const reason = interaction.options.getString('reason') || 'No reason provided'

		// Fetch the guild member from the target user
		const member = await interaction.guild.members.fetch(target.id).catch(() => null)

		if (!member) {
			return interaction.reply({ content: 'User is not in the server', flags: MessageFlags.Ephemeral })
		}
		if (!member.muteable) {
			return interaction.reply({ content: 'I do not have permission to mute this user', flags: MessageFlags.Ephemeral })
		}
        if (member.voice.serverMute) {
			return interaction.reply({ content: `${target.tag} is already muted in voice channels.`, flags: MessageFlags.Ephemeral })
		}

		// Mute the user in voice channel(s) by denying the SPEAK permission
        await member.voice.setMute(true, reason)
        // Deny the SEND_MESSAGES permission in all text channels
		const textChannels = interaction.guild.channels.cache.filter(channel => channel.isTextBased())
		for (const channel of textChannels.values()) {
            const permission = channel.permissionOverwrites.get(member.id)
			if (permission && permission.deny.has('SEND_MESSAGES')) {
				continue
			}
			await channel.permissionOverwrites.edit(member.id, { SEND_MESSAGES: false }, { reason })
        }

		await interaction.reply({ content: `${target.tag} has been muted. Reason: ${reason}` })
		logger.info(`${target.tag} has been muted from the server. Reason: ${reason}`, interaction.guild)
	},
}