module.exports = {
    name: 'broadcast',
    category: 'Owner',
    aliases: ['bc', 'broadcastall'],
    description: 'Broadcast a text message to all groups',

    async execute(sock, m, args) {
        if (!m.isOwner) return m.reply('❌ Owner only.');

        const text = args.join(' ').trim();
        if (!text) {
            return m.reply(
                `📢 *FREEZER-MD BROADCAST*\n\n` +
                `Usage: .broadcast <message>\n` +
                `Example: .broadcast Freezer-MD is online 🥶`
            );
        }

        let groups;
        try {
            groups = await sock.groupFetchAllParticipating();
        } catch (err) {
            console.error('Broadcast fetch error:', err);
            return m.reply('❌ Failed to fetch group list.');
        }

        const groupIds = Object.keys(groups || {});
        if (!groupIds.length) return m.reply('ℹ️ No groups found.');

        await m.react('📢');

        let sent = 0;
        let failed = 0;

        for (const jid of groupIds) {
            try {
                await sock.sendMessage(jid, {
                    text:
                        `╭─〔 🥶 FREEZER-MD 〕─╮\n` +
                        `│ 📢 *BROADCAST*\n` +
                        `╰────────────────╯\n\n` +
                        `${text}\n\n` +
                        `> — FREEZER-MD`
                });
                sent++;
                await new Promise(resolve => setTimeout(resolve, 250));
            } catch (err) {
                failed++;
                console.error(`Broadcast failed for ${jid}:`, err.message);
            }
        }

        return m.reply(
            `╭─〔 📢 BROADCAST COMPLETE 〕─╮\n` +
            `│\n` +
            `│ ✅ Sent: ${sent}\n` +
            `│ ❌ Failed: ${failed}\n` +
            `│ 📊 Groups: ${groupIds.length}\n` +
            `│\n` +
            `╰─〔 🥶 FREEZER-MD 〕─╯`
        );
    }
};
