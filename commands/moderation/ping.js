const { SlashCommandBuilder } = require('discord.js')
const logger = require('../../utility/logger')
const serverInfo = require('../../utility/serverInfo')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		serverInfo.set(interaction.guild)
		await interaction.reply('Pong!')
		logger.info('Pong!')
	},
}