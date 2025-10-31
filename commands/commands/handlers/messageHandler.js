const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config.json');

const commands = new Map();
// load command files
const commandsPath = path.join(__dirname, '..', 'commands');
for (const f of fs.readdirSync(commandsPath)) {
  if (f.endsWith('.js')) {
    const cmd = require(path.join(commandsPath, f));
    commands.set(cmd.name, cmd);
  }
}

async function handleMessage(conn, message) {
  try {
    if (!message.message) return;
    const jid = message.key.remoteJid;
    const text = (message.message.conversation || message.message.extendedTextMessage?.text || '').trim();
    if (!text) return;
    // prefix check
    if (!text.startsWith(config.prefix)) return;

    const withoutPrefix = text.slice(config.prefix.length).trim();
    const split = withoutPrefix.split(/\s+/);
    const cmdName = split[0].toLowerCase();
    const args = split.slice(1);

    const cmd = commands.get(cmdName);
    if (cmd) {
      await cmd.execute({ conn, message, args });
    } else {
      // fallback: unknown command
      await conn.sendMessage(jid, { text: `Command paoa jai nai: ${cmdName}` });
    }
  } catch (err) {
    logger.error(err);
  }
}

module.exports = { handleMessage };
