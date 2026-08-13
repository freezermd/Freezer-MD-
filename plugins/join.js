module.exports = {
    name: 'join',
    category: 'Owner',
    aliases: ['joingroup'],
    description: 'Join a WhatsApp group using an invite link',

    async execute(sock, m, args) {
        if (!m.isOwner) return m.reply('❌ Owner only.');

        const input = args.join(' ').trim();
        if (!input) {
            return m.reply(
                '🔗 *Usage:* .join <WhatsApp group invite link>\n\n' +
                'Example:\n.join https://chat.whatsapp.com/XXXXXXXXXXXX'
            );
        }

        const match = input.match(/chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i);
        const code = match ? match[1] : input.replace(/^https?:\/\//, '').trim();

        if (!code || code.includes('/')) {
            return m.reply('❌ Invalid WhatsApp group invite link/code.');
        }

        try {
            const jid = await sock.groupAcceptInvite(code);
            await m.react('✅');

            return m.reply(
                `╭─〔 🥶 FREEZER-MD 〕─╮\n` +
                `│ ✅ *GROUP JOINED*\n` +
                `│\n` +
                `│ 🆔 ${jid || 'Joined successfully'}\n` +
                `╰────────────────╯`
            );
        } catch (err) {
            console.error('Join error:', err);
            return m.reply(`❌ Failed to join group:\n${err.message}`);
        }
    }
};
