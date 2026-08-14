const axios = require('axios');

module.exports = {
    name: 'tourl',
    category: 'Tools',
    aliases: ['url', 'upload'],
    description: 'Upload replied media and get a public URL',

    async execute(sock, m, args) {
        try {
            const quoted = m.quoted;

            if (!quoted) {
                return m.reply(
                    `❌ *Reply to an image, video, audio, or document.*\n\n` +
                    `Example:\n` +
                    `1. Send/reply to media\n` +
                    `2. Type *.tourl*`
                );
            }

            const type = quoted.mtype || quoted.type || '';

            const allowed = [
                'imageMessage',
                'videoMessage',
                'audioMessage',
                'documentMessage',
                'image',
                'video',
                'audio',
                'document'
            ];

            if (!allowed.includes(type)) {
                return m.reply('❌ Unsupported media type.');
            }

            await m.react('⏳');
            const loading = await m.reply('📤 *Uploading media...*');

            // Download quoted media
            const buffer = await quoted.download();

            if (!buffer || !buffer.length) {
                await m.react('❌');
                return m.reply('❌ Failed to download the media.');
            }

            // Detect filename
            const originalName =
                quoted.fileName ||
                quoted.msg?.fileName ||
                `freezer-${Date.now()}`;

            const mime =
                quoted.mimetype ||
                quoted.msg?.mimetype ||
                'application/octet-stream';

            // Catbox upload
            const form = new FormData();

            form.append(
                'reqtype',
                'fileupload'
            );

            form.append(
                'fileToUpload',
                new Blob([buffer], { type: mime }),
                originalName
            );

            const response = await axios.post(
                'https://catbox.moe/user/api.php',
                form,
                {
                    headers: {
                        ...Object.fromEntries(form.entries())
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    timeout: 60000
                }
            );

            const url = String(response.data || '').trim();

            if (!url.startsWith('http')) {
                console.error('Freezer-MD TOURL response:', response.data);
                await m.react('❌');
                return m.reply('❌ Upload failed. The hosting service returned an invalid URL.');
            }

            await m.react('✅');

            return m.reply(
                `╭━━〔 🥶 FREEZER-MD 〕━━╮\n` +
                `┃ 📤 *MEDIA UPLOADED*\n` +
                `┃\n` +
                `┃ 📁 File: ${originalName}\n` +
                `┃ 📦 Type: ${mime}\n` +
                `┃\n` +
                `┃ 🔗 *URL:*\n` +
                `┃ ${url}\n` +
                `╰━━━━━━━━━━━━━━━━╯`
            );

        } catch (error) {
            console.error(
                'Freezer-MD TOURL Error:',
                error.response?.data || error.message
            );

            await m.react('❌');

            return m.reply(
                `❌ *Upload failed.*\n\n` +
                `Possible reasons:\n` +
                `• Media is too large\n` +
                `• Upload service unavailable\n` +
                `• Network timeout\n\n` +
                `Please try again.`
            );
        }
    }
};
