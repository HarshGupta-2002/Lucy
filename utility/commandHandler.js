const fs = require('fs')
const path = require('path')
const logger = require('./logger')

function loadCommands(client) {
    const foldersPath = path.join(__dirname, '..', 'commands')
    const commandFolders = fs.readdirSync(foldersPath)

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder)
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file)
            const command = require(filePath)
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command)
            } else {
                logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property`)
            }
        }
    }
}

module.exports = { loadCommands }


// const fs = require('fs');
// const path = require('path');
// const logger = require('./logger');
// const commandRegistry = require('../commands/utils/commandRegistry'); // Import the command registry

// function loadCommands(client) {
//     // Loop through the entries in the command registry
//     for (const [commandName, filePath] of Object.entries(commandRegistry)) {
//         try {
//             // Dynamically require the command file using the path from the registry
//             const command = require(filePath);

//             // Check if the required properties ('data' and 'execute') exist in the command file
//             if ('data' in command && 'execute' in command) {
//                 client.commands.set(commandName, command); // Register the command in client.commands
//             } else {
//                 logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property`);
//             }
//         } catch (error) {
//             logger.error(`Error loading command ${commandName}: ${error.message}`);
//         }
//     }
// }

// module.exports = { loadCommands };