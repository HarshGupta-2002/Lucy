require('dotenv').config()
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js')
const logger = require('./utility/logger')
const loadCommands = require('./utility/commandHandler')

const token = process.env.TOKEN
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        // GatewayIntentBits.GuildAuditLogs,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages
    ]
})
client.commands = new Collection()
loadCommands.loadCommands(client)

client.once(Events.ClientReady, readyClient => {
    logger.info(`BRAVO! Bot is online as ${readyClient.user.tag}`)
})

client.on(Events.GuildCreate, guild => {
    logger.info(`Joined a server: ${guild.name} (ID: ${guild.id})`)
})
client.on(Events.GuildDelete, guild => {
	logger.info(`Left a server: ${guild.name} (ID: ${guild.id})`)
})


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return
	const command = interaction.client.commands.get(interaction.commandName)

	if (!command) {
		logger.error(`No command matching ${interaction.commandName} was found.`)
		return
	}

	try {
		await command.execute(interaction)
	} catch (error) {
		logger.error(error)
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral })
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral })
		}
	}
})

client.login(token)