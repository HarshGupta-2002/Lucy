const fs = require('fs')
const path = require('path')
const serverInfo = require('./serverInfo')

function getTimestamp() {
    const now = new Date()
    // Convert to IST (UTC + 5:30)
    const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }
    return now.toLocaleString('en-IN', options).replace(',', '').replace(/\//g, '-').replace(' ', 'T')
}

function log(level, message) {
    const timestamp = getTimestamp()
    const currentServerInfo = serverInfo.get()
    let logMessage = `[${timestamp}] [${level}]`

    if (currentServerInfo) {
        logMessage += ` [Server: ${currentServerInfo.name} (${currentServerInfo.id})]`
    }

    if (level === 'ERROR' && message instanceof Error) {
        logMessage += ` ${message.message}\nStack Trace: ${message.stack}`
    }
    else {
        logMessage += ` ${message}`
    }

    console.log(logMessage)

    // Log to a file (bot.log)
    const logFilePath = path.join(__dirname, '..', 'bot.log')
    fs.appendFileSync(logFilePath, logMessage + '\n')
}

const logger = {
    info: (message) => log('INFO', message),
    warn: (message) => log('WARN', message),
    debug: (message) => log('DEBUG', message),
    error: (message) => {
        if (message instanceof Error) {
            log('ERROR', message);
        } else {
            log('ERROR', new Error(message)); // Convert string message to an Error object
        }
    }
}

module.exports = logger