module.exports = {
    name: 'shutdown',
    category: 'Owner',
    aliases: ['stop', 'poweroff'],
    description: 'Shut down Freezer-MD',

    async execute(sock, m) {
        if (!m.isOwner) return m.reply('❌ Owner only.');

        await m.reply(
            `╭─〔 🥶 FREEZER-MD 〕─╮\n` +
            `│ 🛑 *Shutting down...*\n` +
            `│ 👋 Bot will go offline now.\n` +
            `╰────────────────╯`
        );

        setTimeout(() => {
            process.exit(0);
        }, 1200);
    }
};
