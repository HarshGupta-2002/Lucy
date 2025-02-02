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