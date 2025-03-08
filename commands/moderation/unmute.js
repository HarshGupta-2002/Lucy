const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js')
const logger = require('../../utility/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Unmute user from server')
		.addUserOption(option =>
			option.setName('target')
				.setDescription('User to unmute')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers), // Ensures only users with UnMute permissions can use it

	async execute(interaction) {
		const target = interaction.options.getUser('target')
		const reason = interaction.options.getString('reason') || 'No reason provided'

		// Fetch the guild member from the target user
		const member = await interaction.guild.members.fetch(target.id).catch(() => null)

		if (!member) {
			return interaction.reply({ content: 'User is not in the server', flags: MessageFlags.Ephemeral })
		}
		if (!member.muteable) {
			return interaction.reply({ content: 'I do not have permission to unmute this user', flags: MessageFlags.Ephemeral })
		}
        if (!member.voice.serverMute) {
			return interaction.reply({ content: `${target.tag} is already unmuted in voice channels`, flags: MessageFlags.Ephemeral })
		}

		// Unmute the user in voice channel(s) by providing the SPEAK permission
        await member.voice.setMute(false)
        logger.debug(`${target.tag} unmuted from all vc`, interaction.guild)
        // Provide the SEND_MESSAGES permission in all text channels
		const textChannels = interaction.guild.channels.cache.filter(channel => channel.isTextBased())
		for (const channel of textChannels.values()) {
			await channel.permissionOverwrites.edit(member.id, { SEND_MESSAGES: true })
        }
        logger.debug(`${target.tag} unmuted from all channels`, interaction.guild)

        
		await interaction.reply({ content: `${target.tag} has been unmuted.`})
		logger.info(`${target.tag} has been unmuted from the server.`, interaction.guild)
	},
}