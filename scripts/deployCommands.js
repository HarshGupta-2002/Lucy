require('dotenv').config()
const { REST, Routes } = require('discord.js')
const logger = require('../utility/logger')
const loadCommands = require('../utility/commandHandler')

const token = process.env.TOKEN
const clientId = process.env.CLIENT_ID
const commands = []
const client = { commands: new Map() } // Temporary object to store commands

loadCommands.loadCommands(client)
client.commands.forEach(command => commands.push(command.data.toJSON()))

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		logger.info(`Started refreshing ${commands.length} application (/) commands`)
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		)
		logger.info(`Successfully reloaded ${data.length} application (/) commands`)
	} catch (error) {
		logger.error(error)
	}
})()