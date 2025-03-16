const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js')
const logger = require('../../utility/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Unmute user from voice channels')
		.addUserOption(option =>
			option.setName('target')
				.setDescription('User to unmute')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers), // Ensures only users with UnMute permissions can use it

	async execute(interaction) {
		const target = interaction.options.getUser('target')

		// Fetch the guild member from the target user
		const member = await interaction.guild.members.fetch(target.id).catch(() => null)
		const scope  = await interaction.guild.members.fetchMe().catch(() => null)

		if (!member) {
			return interaction.reply({ content: 'User is not in the server', flags: MessageFlags.Ephemeral })
		}
		if (!member.voice.channel) {
			return interaction.reply({ content: 'User is not in a voice channel', flags: MessageFlags.Ephemeral })
		}
		if (!scope.permissions.has('MUTE_MEMBERS')) {
			return interaction.reply({ content: 'I do not have permission to unmute members', flags: MessageFlags.Ephemeral })
		}
        if (!member.voice.serverMute) {
			return interaction.reply({ content: `${target.tag} is already unmuted in voice channels`, flags: MessageFlags.Ephemeral })
		}

		// Unmute the user in voice channel(s) by providing the SPEAK permission
        await member.voice.setMute(false)        
		await interaction.reply({ content: `${target.tag} has been unmuted`})
		logger.info(`${target.tag} has been unmuted from voice channels`, interaction.guild)
	},
}