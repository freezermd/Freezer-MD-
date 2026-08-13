function normalizeJid(value = '') {
    let jid = String(value).trim();
    jid = jid.replace(/^@/, '');

    if (jid.includes('@')) return jid.split(':')[0];

    const number = jid.replace(/\D/g, '');
    return number ? `${number}@s.whatsapp.net` : '';
}

function getTarget(m, args) {
    if (m.quoted?.sender) return m.quoted.sender;
    if (args[0]) return normalizeJid(args[0]);
    return '';
}

module.exports = {
    name: 'block',
    category: 'Owner',
    aliases: ['blockuser'],
    description: 'Block a WhatsApp user',

    async execute(sock, m, args) {
        if (!m.isOwner) return m.reply('❌ Owner only.');

        const jid = getTarget(m, args);
        if (!jid) {
            return m.reply(
                '❌ Reply to a user or provide a number.\n\n' +
                'Example: .block 254712345678'
            );
        }

        if (!jid.endsWith('@s.whatsapp.net')) {
            return m.reply('❌ Please provide a WhatsApp user number.');
        }

        try {
            await sock.updateBlockStatus(jid, 'block');
            await m.react('🚫');
            return m.reply(`🚫 *Blocked successfully*\n\n👤 @${jid.split('@')[0]}`, {
                mentions: [jid]
            });
        } catch (err) {
            console.error('Block error:', err);
            return m.reply(`❌ Failed to block user:\n${err.message}`);
        }
    }
};
