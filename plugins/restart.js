module.exports = {
    name: 'restart',
    category: 'Owner',
    aliases: ['reboot'],
    description: 'Restart Freezer-MD',

    async execute(sock, m) {
        if (!m.isOwner) return m.reply('❌ Owner only.');

        await m.reply(
            `╭─〔 🥶 FREEZER-MD 〕─╮\n` +
            `│ 🔄 *Restarting bot...*\n` +
            `│ ⏳ Please wait a moment.\n` +
            `╰────────────────╯`
        );

        setTimeout(() => {
            process.exit(0);
        }, 1200);
    }
};
