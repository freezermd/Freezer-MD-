module.exports = {
    name: 'leave',
    category: 'Owner',
    aliases: ['leavegroup'],
    description: 'Leave the current WhatsApp group',

    async execute(sock, m) {
        if (!m.isOwner) return m.reply('❌ Owner only.');
        if (!m.isGroup) return m.reply('❌ This command can only be used inside a group.');

        const groupName = m.groupMetadata?.subject || 'this group';

        try {
            await m.reply(`👋 *Leaving ${groupName}...*`);
            await sock.groupLeave(m.from);
        } catch (err) {
            console.error('Leave error:', err);
            return m.reply(`❌ Failed to leave group:\n${err.message}`);
        }
    }
};
