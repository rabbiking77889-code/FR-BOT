module.exports = {
  name: 'all',
  description: 'Mention all group members',
  async execute({ conn, message, args }) {
    const jid = message.key.remoteJid;
    if (!jid.endsWith('@g.us')) {
      return conn.sendMessage(jid, { text: 'Eta group command.' });
    }
    // fetch participants list
    const metadata = await conn.groupMetadata(jid);
    const participants = metadata.participants || [];
    const mentions = participants.map(p => p.id);
    const text = args.join(' ') || 'Attention!';
    await conn.sendMessage(jid, { text, mentions });
  }
};
