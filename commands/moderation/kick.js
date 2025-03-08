const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js')
const logger = require('../../utility/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kick user from server')
		.addUserOption(option =>
			option.setName('target')
				.setDescription('User to kick')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Reason for kick')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // Ensures only users with Kick permissions can use it

	async execute(interaction) {
		const target = interaction.options.getUser('target')
		const reason = interaction.options.getString('reason') || 'No reason provided'

		// Fetch the guild member from the target user
		const member = await interaction.guild.members.fetch(target.id).catch(() => null)

		if (!member) {
			return interaction.reply({ content: 'User is not in the server', flags: MessageFlags.Ephemeral })
		}
		if (!member.kickable) {
			return interaction.reply({ content: 'I do not have permission to kick this user', flags: MessageFlags.Ephemeral })
		}

		// Kick the user
		await member.kick({ reason })
		await interaction.reply({ content: `${target.tag} has been kicked. Reason: ${reason}` })
		logger.info(`${target.tag} has been kicked from the server. Reason: ${reason}`, interaction.guild)
	},
}