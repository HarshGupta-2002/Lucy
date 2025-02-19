const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user from the server.')
		.addUserOption(option =>
			option.setName('target')
				.setDescription('The user to ban')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Reason for the ban')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Ensures only users with Ban permissions can use it

	async execute(interaction) {
		const target = interaction.options.getUser('target')
		const reason = interaction.options.getString('reason') || 'No reason provided'

		// Fetch the guild member from the target user
		const member = await interaction.guild.members.fetch(target.id).catch(() => null)

		// Check if the user is in the server
		if (!member) {
			return interaction.reply({ content: 'User is not in the server.', flags: 64 })
		}

		// Check if the bot has permission to ban the user
		if (!member.bannable) {
			return interaction.reply({ content: 'I do not have permission to ban this user.', flags: 64 })
		}

		// Ban the user
		await member.ban({ reason })

		// Confirmation message
		await interaction.reply({ content: `${target.tag} has been banned. Reason: ${reason}` })
	},
}