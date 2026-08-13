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
                : `🟢 ᴀᴄᴛɪᴠᴇ (${global.antidelete})`;

            return m.reply(
                `✨ *𝐅𝐑𝐄𝐄𝐙𝐄𝐑-𝐌𝐃 𝐀𝐍𝐓𝐈-𝐃𝐄𝐋𝐄𝐓𝐄* ✨\n` +
                `══════════════════════⊷\n` +
                `📊 *ᴄᴜʀʀᴇɴᴛ:* ${current}\n\n` +
                `📝 *ᴀᴠᴀɪʟᴀʙʟᴇ ꜱᴇᴛᴛɪɴɢꜱ:* \n` +
                `◦ .antidelete inchat (Sends to the group)\n` +
                `◦ .antidelete indm (Sends to your DM)\n` +
                `◦ .antidelete false (Turn off)\n` +
                `══════════════════════⊷\n` +
                `> 𝖥𝗋𝖾𝖾𝗓𝖾𝗋 𝖬𝖽 𝖤𝗇𝗀𝗂𝗇𝖾 🇰🇪`
            );
        }

        // 2. PROCESS TOGGLE
        global.antidelete = input;

        await m.react(input === 'false' ? '❌' : '🛡️');

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
            `> ꜱᴇᴛᴛɪɴɢꜱ ᴀᴘᴘʟɪᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ 🚀`;

        return m.reply(feedback);
    }
};
