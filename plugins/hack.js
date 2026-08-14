module.exports = {
    name: 'hack',
    category: 'Fun',
    aliases: ['prankhack', 'prank'],
    description: 'Fake cinematic hacking prank',

    async execute(sock, m, args) {
        const target =
            m.mentionedJid?.[0] ||
            m.quoted?.sender ||
            m.sender;

        const tag = `@${target.split('@')[0]}`;

        const sleep = ms =>
            new Promise(resolve => setTimeout(resolve, ms));

        const fakeIP = () =>
            `${Math.floor(Math.random() * 223) + 1}.` +
            `${Math.floor(Math.random() * 255)}.` +
            `${Math.floor(Math.random() * 255)}.` +
            `${Math.floor(Math.random() * 254) + 1}`;

        const progress = () => {
            const bars = [
                '▱▱▱▱▱▱▱▱▱▱ 0%',
                '▰▱▱▱▱▱▱▱▱▱ 10%',
                '▰▰▱▱▱▱▱▱▱▱ 20%',
                '▰▰▰▱▱▱▱▱▱▱ 30%',
                '▰▰▰▰▱▱▱▱▱▱ 40%',
                '▰▰▰▰▰▱▱▱▱▱ 50%',
                '▰▰▰▰▰▰▱▱▱▱ 60%',
                '▰▰▰▰▰▰▰▱▱▱ 70%',
                '▰▰▰▰▰▰▰▰▱▱ 80%',
                '▰▰▰▰▰▰▰▰▰▱ 90%',
                '▰▰▰▰▰▰▰▰▰▰ 100%'
            ];

            return bars[Math.floor(Math.random() * bars.length)];
        };

        const ip = fakeIP();

        await m.react('👀');

        const loading = await m.reply(
            `🥶 *FREEZER-MD CYBER TERMINAL*\n\n` +
            `🎯 Target: ${tag}\n` +
            `🌐 Establishing connection...`
        );

        const update = async text => {
            try {
                await sock.sendMessage(
                    m.from,
                    {
                        text,
                        mentions: [target],
                        edit: loading.key
                    }
                );
            } catch {
                await sock.sendMessage(
                    m.from,
                    {
                        text,
                        mentions: [target]
                    }
                );
            }
        };

        await sleep(1200);

        await update(
            `🥶 *FREEZER-MD CYBER TERMINAL*\n\n` +
            `🎯 Target: ${tag}\n` +
            `🌐 IP detected: \`${ip}\`\n` +
            `🔎 Scanning target...\n\n` +
            `${progress()}`
        );

        await sleep(1400);

        await update(
            `🥶 *FREEZER-MD CYBER TERMINAL*\n\n` +
            `🎯 Target: ${tag}\n` +
            `🌐 IP: \`${ip}\`\n` +
            `🔐 Firewall detected\n` +
            `⚡ Attempting bypass...\n\n` +
            `${progress()}`
        );

        await sleep(1600);

        await update(
            `🥶 *FREEZER-MD CYBER TERMINAL*\n\n` +
            `🎯 Target: ${tag}\n` +
            `🔓 Firewall bypass: SUCCESS\n` +
            `💾 Accessing secret files...\n\n` +
            `${progress()}`
        );

        await sleep(1500);

        await update(
            `🥶 *FREEZER-MD CYBER TERMINAL*\n\n` +
            `🎯 Target: ${tag}\n` +
            `📂 Files found: 1,284\n` +
            `🔑 Encryption: AES-999\n` +
            `🧬 Decrypting...\n\n` +
            `${progress()}`
        );

        await sleep(1800);

        await update(
            `☠️ *ACCESS GRANTED*\n\n` +
            `🎯 Target: ${tag}\n` +
            `🌐 IP: \`${ip}\`\n` +
            `🔓 Security: BYPASSED\n` +
            `💾 Files: DECRYPTED\n` +
            `📱 Device: COMPROMISED\n\n` +
            `⚠️ Extracting data...`
        );

        await sleep(1800);

        await update(
            `😂😂 *GOTCHA!*\n\n` +
            `🎯 ${tag}\n\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `🥶 YOU JUST GOT PRANKED!\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `☠️ No device was hacked.\n` +
            `🔐 No data was accessed.\n` +
            `🤫 It was all fake!\n\n` +
            `> 🥶 *FREEZER-MD PRANK ENGINE*`
        );

        await m.react('😂');
    }
};
