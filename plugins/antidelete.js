module.exports = {
    name: 'antidelete',
    aliases: ['ad', 'antidel'],
    category: 'Admin',
    description: 'Configure Anti-Delete protection',

    async execute(sock, m, args) {
        if (!m.isOwner) return;

        const input = (args[0] || '').toLowerCase();

        // 1. DASHBOARD VIEW
        if (!['inchat', 'indm', 'false'].includes(input)) {
            const current = global.antidelete === 'false'
                ? '🔴 ᴅɪꜱᴀʙʟᴇᴅ'
                : `🟢 ᴀᴄᴛɪᴠᴇ (${global.antidelete || 'inchat'})`;

            return m.reply(
                `✨ *𝐅𝐑𝐄𝐄𝐙𝐄𝐑-𝐌𝐃 𝐀𝐍𝐓𝐈-𝐃𝐄𝐋𝐄𝐓𝐄* ✨\n` +
                `══════════════════════⊷\n` +
                `📊 *ᴄᴜʀʀᴇɴᴛ:* ${current}\n\n` +
                `📝 *ᴀᴠᴀɪʟᴀʙʟᴇ ꜱᴇᴛᴛɪɴɢꜱ:*\n` +
                `◦ .antidelete inchat — Sends to the group\n` +
                `◦ .antidelete indm — Sends to your DM\n` +
                `◦ .antidelete false — Turn off\n` +
                `══════════════════════⊷\n` +
                `> 𝐅𝐫𝐞𝐞𝐳𝐞𝐫-𝐌𝐃 𝐄𝐧𝐠𝐢𝐧𝐞 🧊🇰🇪`
            );
        }

        // 2. PROCESS TOGGLE
        global.antidelete = input;

        if (typeof m.react === 'function') {
            await m.react(input === 'false' ? '❌' : '🛡️');
        }

        // 3. SUCCESS CARD
        const statusIcon = input === 'false'
            ? '🔴 ᴅɪꜱᴀʙʟᴇᴅ'
            : `🟢 ᴇɴᴀʙʟᴇᴅ (${input})`;

        const feedback =
            `✨ *𝐅𝐑𝐄𝐄𝐙𝐄𝐑-𝐌𝐃 𝐔𝐏𝐃𝐀𝐓𝐄* ✨\n` +
            `══════════════════\n` +
            `✅ *ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ꜱᴇᴛ*\n` +
            `📊 *ꜱᴛᴀᴛᴜꜱ:* ${statusIcon}\n` +
            `🛡️ *ᴇɴɢɪɴᴇ:* ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ\n` +
            `══════════════════\n` +
            `> 𝐅𝐫𝐞𝐞𝐳𝐞𝐫-𝐌𝐃 𝐒𝐲𝐬𝐭𝐞𝐦 🧊\n` +
            `> ꜱᴇᴛᴛɪɴɢꜱ ᴀᴘᴘʟɪᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ 🚀`;

        return m.reply(feedback);
    }
};
