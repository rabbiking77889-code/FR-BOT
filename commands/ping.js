module.exports = {
  name: 'ping',
  description: 'Check bot pong',
  async execute({ conn, message, args }) {
    const sent = await conn.sendMessage(message.key.remoteJid, { text: 'Pong!' });
  }
};
