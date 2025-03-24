module.exports = {
    data: {
        name: 'hello',
        description: 'Sends a hello message'
    },
    async execute(interaction) {
        await interaction.reply('Hey there!')
    }
}