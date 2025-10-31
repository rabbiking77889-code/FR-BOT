const config = require('../config.json');

async function groupUpdateHandler(conn, update) {
  try {
    // update: { id, participants, action }
    if (!update || !update.participants) return;
    const jid = update.id;
    if (update.action === 'add') {
      for (const participant of update.participants) {
        const text = config.welcomeMessage.replace('@user', '@' + participant.split('@')[0]);
        await conn.sendMessage(jid, { text, mentions: [participant] });
      }
    }
    if (update.action === 'remove') {
      // optional: farewell
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = { groupUpdateHandler };
