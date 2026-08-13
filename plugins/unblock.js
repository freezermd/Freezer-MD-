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
    name: 'unblock',
    category: 'Owner',
    aliases: ['unblockuser'],
    description: 'Unblock a WhatsApp user',

    async execute(sock, m, args) {
        if (!m.isOwner) return m.reply('❌ Owner only.');

        const jid = getTarget(m, args);
        if (!jid) {
            return m.reply(
                '❌ Reply to a user or provide a number.\n\n' +
                'Example: .unblock 254712345678'
            );
        }

        if (!jid.endsWith('@s.whatsapp.net')) {
            return m.reply('❌ Please provide a WhatsApp user number.');
        }

        try {
            await sock.updateBlockStatus(jid, 'unblock');
            await m.react('✅');
            return m.reply(`✅ *Unblocked successfully*\n\n👤 @${jid.split('@')[0]}`, {
                mentions: [jid]
            });
        } catch (err) {
            console.error('Unblock error:', err);
            return m.reply(`❌ Failed to unblock user:\n${err.message}`);
        }
    }
};
