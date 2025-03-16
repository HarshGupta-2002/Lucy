const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js')
const logger = require('../../utility/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Mute user from voice channels')
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

		const member = await interaction.guild.members.fetch(target.id).catch(() => null)
		const scope  = await interaction.guild.members.fetchMe().catch(() => null)

		if (!member) {
			return interaction.reply({ content: 'User is not in the server', flags: MessageFlags.Ephemeral })
		}
		if (!member.voice.channel) {
			return interaction.reply({ content: 'User is not in a voice channel', flags: MessageFlags.Ephemeral })
		}
		if (!scope.permissions.has('MUTE_MEMBERS')) {
			return interaction.reply({ content: 'I do not have permission to mute members', flags: MessageFlags.Ephemeral })
		}
        if (member.voice.serverMute) {
			return interaction.reply({ content: `${target.tag} is already muted in voice channels`, flags: MessageFlags.Ephemeral })
		}

		// Mute the user in voice channel(s) by denying the SPEAK permission
        await member.voice.setMute(true, reason)
		await interaction.reply({ content: `${target.tag} has been muted. Reason: ${reason}` })
		logger.info(`${target.tag} has been muted from voice channels. Reason: ${reason}`, interaction.guild)
	},
}