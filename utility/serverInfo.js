let currentServer = null

function set(guild) {
    currentServer = {
        name: guild.name,
        id: guild.id,
    }
}

function get() {
    return currentServer
}

module.exports = {set, get}

// let serverInfoMap = new Map()

// function set(guild) {
//     serverInfoMap.set(guild.id, {
//         name: guild.name,
//         id: guild.id,
//     })
// }

// function get(guildId) {
//     return serverInfoMap.get(guildId) || null
// }

// module.exports = { set, get }