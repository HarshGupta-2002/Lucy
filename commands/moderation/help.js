const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js')
const logger = require('../../utility/logger')

const commandDocs = {
	ping: {
		category: 'General',
		description: 'Check bot responsiveness and connectivity',
		usage: '/ping',
		permissions: 'None',
		details: 'Replies with "Pong!" to verify the bot is online and responding to interactions.'
	},
	hello: {
		category: 'General',
		description: 'Sends a friendly greeting',
		usage: '/hello',
		permissions: 'None',
		details: 'Sends a quick friendly greeting in the channel.'
	},
	help: {
		category: 'General',
		description: 'Displays the list of commands or detailed documentation for a specific command',
		usage: '/help [command]',
		permissions: 'None',
		details: 'Shows all available commands categorized by type. Provide an optional command name for detailed parameter and usage info.'
	},
	ban: {
		category: 'Moderation',
		description: 'Permanently ban a member from the server',
		usage: '/ban target:<@user> [reason:<text>]',
		permissions: 'Ban Members',
		details: 'Bans the specified user from the Discord server. Checks if the user is in the server and if the bot has higher hierarchy permissions to ban them.'
	},
	kick: {
		category: 'Moderation',
		description: 'Kick a member from the server',
		usage: '/kick target:<@user> [reason:<text>]',
		permissions: 'Kick Members',
		details: 'Kicks the specified user from the Discord server. The user can rejoin if they have a valid invite link.'
	},
	mute: {
		category: 'Moderation',
		description: 'Server-mute a member in voice channels',
		usage: '/mute target:<@user> [reason:<text>]',
		permissions: 'Mute Members',
		details: 'Mutes the target user in voice channels by applying a server mute. The user must currently be connected to a voice channel in the server.'
	},
	unmute: {
		category: 'Moderation',
		description: 'Remove server-mute from a member in voice channels',
		usage: '/unmute target:<@user>',
		permissions: 'Mute Members',
		details: 'Unmutes the target user in voice channels. The user must currently be in a voice channel.'
	},
	timeout: {
		category: 'Moderation',
		description: 'Restrict a member from sending messages across all text channels',
		usage: '/timeout target:<@user> [duration:<hours>] [reason:<text>]',
		permissions: 'Manage Messages',
		details: 'Applies channel permission overwrites across all text channels to deny Send Messages. If a duration (in hours) is supplied, an automated timer restores messaging access when it expires.'
	},
	'remove-timeout': {
		category: 'Moderation',
		description: 'Restore message sending permissions for a timed-out member',
		usage: '/remove-timeout target:<@user>',
		permissions: 'Manage Messages',
		details: 'Removes the Send Messages channel permission restrictions across all text channels for the target member.'
	},
	invite: {
		category: 'Moderation',
		description: 'Generate and DM a one-time server invite link to a user',
		usage: '/invite target:<@user>',
		permissions: 'None',
		details: 'Creates a unique, one-time use invite link with infinite expiration and sends it directly to the specified user via Direct Message.'
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List all commands or get documentation for a specific command')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to get detailed information about')
				.setRequired(false)
				.addChoices(
					{ name: 'ping', value: 'ping' },
					{ name: 'hello', value: 'hello' },
					{ name: 'help', value: 'help' },
					{ name: 'ban', value: 'ban' },
					{ name: 'kick', value: 'kick' },
					{ name: 'mute', value: 'mute' },
					{ name: 'unmute', value: 'unmute' },
					{ name: 'timeout', value: 'timeout' },
					{ name: 'remove-timeout', value: 'remove-timeout' },
					{ name: 'invite', value: 'invite' }
				)),

	async execute(interaction) {
		try {
			const commandQuery = interaction.options.getString('command')

			if (commandQuery) {
				const doc = commandDocs[commandQuery.toLowerCase()]
				if (!doc) {
					return interaction.reply({
						content: `No documentation found for command: \`/${commandQuery}\``,
						flags: MessageFlags.Ephemeral
					})
				}

				const detailEmbed = new EmbedBuilder()
					.setColor(0x5865F2)
					.setTitle(`Command Documentation: /${commandQuery}`)
					.setDescription(doc.description)
					.addFields(
						{ name: 'Category', value: doc.category, inline: true },
						{ name: 'Permission Required', value: doc.permissions, inline: true },
						{ name: 'Usage', value: `\`${doc.usage}\``, inline: false },
						{ name: 'Details', value: doc.details, inline: false }
					)
					.setFooter({ text: 'Tip: Required parameters are marked with <>, optional with []' })

				return interaction.reply({ embeds: [detailEmbed], flags: MessageFlags.Ephemeral })
			}

			// Generate general overview embed
			const generalCommands = []
			const moderationCommands = []

			for (const [name, doc] of Object.entries(commandDocs)) {
				const entry = `\`/${name}\` — ${doc.description}`
				if (doc.category === 'General') {
					generalCommands.push(entry)
				} else {
					moderationCommands.push(entry)
				}
			}

			const overviewEmbed = new EmbedBuilder()
				.setColor(0x5865F2)
				.setTitle('Lucy — Command Documentation')
				.setDescription('Here is a complete list of commands supported by Lucy. Use `/help [command]` for detailed usage instructions and parameters.')
				.addFields(
					{
						name: '🟢 General / Utility Commands',
						value: generalCommands.join('\n') || 'None'
					},
					{
						name: '🔴 Moderation Commands',
						value: moderationCommands.join('\n') || 'None'
					},
					{
						name: '💡 How to Run Commands',
						value: 'Type `/` followed by the command name in any channel where Lucy has permissions. Discord will display interactive option prompts for required and optional fields.'
					}
				)
				.setFooter({ text: 'Lucy Discord Bot' })

			await interaction.reply({ embeds: [overviewEmbed], flags: MessageFlags.Ephemeral })
			logger.info(`Help command executed by ${interaction.user.tag}`, interaction.guild)
		} catch (error) {
			logger.error(error, interaction.guild)
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while generating the help documentation!', flags: MessageFlags.Ephemeral })
			} else {
				await interaction.reply({ content: 'There was an error while generating the help documentation!', flags: MessageFlags.Ephemeral })
			}
		}
	}
}
