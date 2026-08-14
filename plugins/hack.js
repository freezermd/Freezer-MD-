module.exports = {
    name: 'hack',
    category: 'Fun',
    aliases: ['fakehack', 'prankhack'],
    description: 'Simulate a fake hacking sequence for fun',
    usage: '.hack <target>',

    async execute(sock, m, args) {
        const chatId = m.from || m.key.remoteJid;
        const target =
            args?.join(' ') ||
            (m.mentionedJid?.[0]
                ? `@${m.mentionedJid[0].split('@')[0]}`
                : 'target');

        try {
            await send(sock, chatId, m,
                '💻 *FREEZER-MD CYBER TERMINAL*\n\n' +
                `🎯 Target: *${target}*\n\n` +
                '⚡ Initializing prank sequence...'
            );

            await delay(1200);

            await send(sock, chatId, m,
                '🔌 *Establishing secure connection...*\n\n' +
                '🌐 Connecting to target server...'
            );

            await delay(1200);

            await send(sock, chatId, m,
                '🛡️ *Bypassing security protocols...*'
            );

            await displayProgressBar(
                sock,
                m,
                'Bypassing firewall',
                5,
                chatId
            );

            await send(sock, chatId, m,
                '🔐 *Accessing encrypted database...*'
            );

            await delay(1500);

            await send(sock, chatId, m,
                '🔑 *Cracking encryption keys...*'
            );

            await displayProgressBar(
                sock,
                m,
                'Decrypting',
                6,
                chatId
            );

            await send(sock, chatId, m,
                '📥 *Downloading classified files...*'
            );

            await displayProgressBar(
                sock,
                m,
                'Downloading',
                5,
                chatId
            );

            await send(sock, chatId, m,
                '🔒 *Installing fake backdoor...*'
            );

            await delay(1800);

            await send(sock, chatId, m,
                '☠️ *ACCESS GRANTED*\n\n' +
                `🎯 Target: *${target}*\n` +
                '🔓 Security: BYPASSED\n' +
                '💾 Files: DECRYPTED\n' +
                '📡 Connection: ACTIVE'
            );

            await delay(1500);

            await send(sock, chatId, m,
                '💥 *HACK COMPLETE!* 💥\n\n' +
                `🎯 *${target}* has been successfully compromised...`
            );

            await delay(1500);

            await send(sock, chatId, m,
                '😂😂😂 *GOTCHA!* 😂😂😂\n\n' +
                '🥶 *YOU JUST GOT PRANKED!*\n\n' +
                '━━━━━━━━━━━━━━━━━━\n' +
                '🔐 No device was hacked.\n' +
                '💾 No files were accessed.\n' +
                '🕵️ No information was stolen.\n' +
                '━━━━━━━━━━━━━━━━━━\n\n' +
                '> 🥶 *FREEZER-MD PRANK ENGINE*'
            );

            await m.react('😂');

        } catch (error) {
            console.error('Freezer-MD hack prank error:', error);

            await sock.sendMessage(
                chatId,
                {
                    text:
                        '⚠️ *Prank sequence interrupted.*\n\n' +
                        'Try `.hack` again.'
                },
                { quoted: m }
            ).catch(() => {});
        }
    }
};


// ─────────────────────────────
// DELAY
// ─────────────────────────────

const delay = ms =>
    new Promise(resolve => setTimeout(resolve, ms));


// ─────────────────────────────
// SEND MESSAGE
// ─────────────────────────────

async function send(sock, chatId, message, text) {
    return sock.sendMessage(
        chatId,
        { text },
        { quoted: message }
    );
}


// ─────────────────────────────
// PROGRESS BAR
// ─────────────────────────────

async function displayProgressBar(
    sock,
    message,
    taskName,
    steps,
    chatId
) {
    const length = 20;

    for (let i = 1; i <= steps; i++) {

        const progress = Math.round(
            (i / steps) * length
        );

        const bar =
            '█'.repeat(progress) +
            '░'.repeat(length - progress);

        await sock.sendMessage(
            chatId,
            {
                text:
                    `🥶 *FREEZER-MD TERMINAL*\n\n` +
                    `⚙️ *${taskName}*\n` +
                    `[${bar}] ${Math.round((i / steps) * 100)}%`
            },
            { quoted: message }
        );

        await delay(700);
    }
}
