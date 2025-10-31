const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidDecode } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const { handleMessage } = require('./handlers/messageHandler');
const { groupUpdateHandler } = require('./handlers/groupUpdateHandler');
const logger = require('./utils/logger');
const config = require('./config.json');

const { state, saveState } = useSingleFileAuthState('./sessions/auth_info_multi.json');

async function startBot() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const conn = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    version
  });

  conn.ev.on('creds.update', saveState);

  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (update.qr) {
      qrcode.generate(update.qr, { small: true });
      console.log('Scan the QR code above with WhatsApp on your phone.');
    }
    if (connection === 'close') {
      const reason = (lastDisconnect?.error && Boom.isBoom(lastDisconnect.error)) ? lastDisconnect.error.output.statusCode : 0;
      console.log('Connection closed, reason:', reason);
      // try reconnect
      startBot();
    } else if (connection === 'open') {
      console.log('Bot connected ✅');
    }
  });

  conn.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg) return;
      // ignore status messages
      if (msg.key && msg.key.remoteJid === 'status@broadcast') return;
      await handleMessage(conn, msg);
    } catch (e) {
      logger.error(e);
    }
  });

  // group participant events
  conn.ev.on('group-participants.update', async (update) => {
    await groupUpdateHandler(conn, update);
  });

  return conn;
}

startBot().catch(err => {
  console.error('Start error', err);
});
