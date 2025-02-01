const {Client, Events, GatewayIntentBits} = require('discord.js')
require('dotenv').config()

const client = new Client({intents: [GatewayIntentBits.Guilds]})

client.once(Events.ClientReady, readyClient => {
    console.log(`BRAVO! Bot is online as ${readyClient.user.tag}`)
})

client.login(process.env.TOKEN)