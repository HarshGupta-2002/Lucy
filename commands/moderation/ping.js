const { SlashCommandBuilder } = require('discord.js')
const logger = require('../../utility/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!')
		logger.info('Pong!', interaction.guild)
	},
}