const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js')
const logger = require('../../utility/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban user from server')
		.addUserOption(option =>
			option.setName('target')
				.setDescription('User to ban')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Reason for ban')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Ensures only users with Ban permissions can use it

	async execute(interaction) {
		const target = interaction.options.getUser('target')
		const reason = interaction.options.getString('reason') || 'No reason provided'

		// Fetch the guild member from the target user
		const member = await interaction.guild.members.fetch(target.id).catch(() => null)

		if (!member) {
			return interaction.reply({ content: 'User is not in the server', flags: MessageFlags.Ephemeral })
		}
		if (!member.bannable) {
			return interaction.reply({ content: 'I do not have permission to ban this user', flags: MessageFlags.Ephemeral })
		}

		// Ban the user
		await member.ban({ reason })
		await interaction.reply({ content: `${target.tag} has been banned. Reason: ${reason}` })
		logger.info(`${target.tag} has been banned from server. Reason: ${reason}`, interaction.guild)
	},
}