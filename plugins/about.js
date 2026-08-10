module.exports = {
    name: 'about',
    category: 'General',
    aliases: ['info', 'botinfo'],
    description: 'Display information about FREEZER MD',
    tags: ['main'],

    async execute(sock, m) {
        try {
            const about = `╭─〔 🧊 FREEZER MD 〕─╮
│
│ ❄️ *FREEZER MD*
│
│ 🤖 Version  : 1.0.0
│ ⚡ Status   : Online
│ 🧩 Type     : WhatsApp Bot
│ 🛠️ Engine   : Baileys
│
│ 🚀 Features
│ ├─ 🤖 AI Tools
│ ├─ 🎵 Media Tools
│ ├─ 👥 Group Tools
│ ├─ 🛠️ Utilities
│ └─ 👑 Owner Tools
│
│ 📢 Official Channel
│ Tap the button below to
│ follow FREEZER MD updates.
│
╰─〔 ❄️ FREEZER MD 〕─╯`;

            await sock.sendMessage(m.from, {
                text: about,
                contextInfo: {
                    externalAdReply: {
                        title: '🧊 FREEZER MD V1.0',
                        body: 'Official Bot • Updates • Features',
                        thumbnailUrl: 'https://i.ibb.co/WNv1hWXT/file-000000001f5c81f4a38f20223ae695d1.png',
                        sourceUrl: 'https://whatsapp.com/channel/0029Vb87tM1D8SE7qCVjbq3U',
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            });

        } catch (err) {
            console.error('❌ About plugin error:', err);

            await m.reply(
                '🧊 *FREEZER MD*\n\n❌ Unable to load bot information.'
            );
        }
    },
};
