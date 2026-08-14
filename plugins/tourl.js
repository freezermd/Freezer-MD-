const axios = require('axios');
const FormData = require('form-data');

const TIMEOUT = 120000;

async function uploadCatbox(buffer, filename, mime) {
    const form = new FormData();

    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, {
        filename,
        contentType: mime
    });

    const res = await axios.post(
        'https://catbox.moe/user/api.php',
        form,
        {
            headers: form.getHeaders(),
            timeout: TIMEOUT,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        }
    );

    const url = String(res.data || '').trim();

    if (!url.startsWith('http')) {
        throw new Error(`Catbox returned: ${url}`);
    }

    return url;
}

async function uploadUguu(buffer, filename, mime) {
    const form = new FormData();

    form.append('files[]', buffer, {
        filename,
        contentType: mime
    });

    const res = await axios.post(
        'https://uguu.se/upload',
        form,
        {
            headers: form.getHeaders(),
            timeout: TIMEOUT,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        }
    );

    const data = res.data;

    const url =
        data?.files?.[0]?.url ||
        data?.url ||
        (Array.isArray(data) ? data[0]?.url : null);

    if (!url || !String(url).startsWith('http')) {
        throw new Error(`Uguu returned invalid response`);
    }

    return url;
}

async function upload0x0(buffer, filename, mime) {
    const form = new FormData();

    form.append('file', buffer, {
        filename,
        contentType: mime
    });

    const res = await axios.post(
        'https://0x0.st',
        form,
        {
            headers: form.getHeaders(),
            timeout: TIMEOUT,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        }
    );

    const url = String(res.data || '').trim();

    if (!url.startsWith('http')) {
        throw new Error(`0x0 returned: ${url}`);
    }

    return url;
}

module.exports = {
    name: 'tourl',
    category: 'Tools',
    aliases: ['url', 'upload'],
    description: 'Upload media and automatically find a working public URL',

    async execute(sock, m, args) {
        try {
            if (!m.quoted) {
                return m.reply(
                    `❌ *Reply to an image, video, audio, or document.*\n\n` +
                    `Example:\n` +
                    `1. Reply to media\n` +
                    `2. Type *.tourl*`
                );
            }

            const quoted = m.quoted;

            const mime =
                quoted.mimetype ||
                quoted.msg?.mimetype ||
                '';

            if (!mime) {
                return m.reply('❌ Could not detect the media type.');
            }

            const supported =
                mime.startsWith('image/') ||
                mime.startsWith('video/') ||
                mime.startsWith('audio/') ||
                mime.startsWith('application/');

            if (!supported) {
                return m.reply('❌ Unsupported media type.');
            }

            await m.react('⏳');

            const loading = await m.reply(
                '📤 *Preparing media...*'
            );

            let buffer;

            try {
                buffer = await quoted.download();
            } catch (err) {
                console.error('TOURL download error:', err);
                await m.react('❌');
                return m.reply('❌ Failed to download the media.');
            }

            if (!buffer || !Buffer.isBuffer(buffer) || !buffer.length) {
                await m.react('❌');
                return m.reply('❌ Media buffer is empty.');
            }

            const filename =
                quoted.fileName ||
                quoted.msg?.fileName ||
                `freezer-${Date.now()}`;

            const sizeMB = (
                buffer.length / 1024 / 1024
            ).toFixed(2);

            const uploaders = [
                {
                    name: 'Catbox',
                    upload: () =>
                        uploadCatbox(buffer, filename, mime)
                },
                {
                    name: 'Uguu',
                    upload: () =>
                        uploadUguu(buffer, filename, mime)
                },
                {
                    name: '0x0.st',
                    upload: () =>
                        upload0x0(buffer, filename, mime)
                }
            ];

            let finalUrl = null;
            let usedHost = null;
            const failures = [];

            for (const uploader of uploaders) {
                try {
                    await editMessage(
                        sock,
                        m,
                        loading,
                        `📤 *Uploading media...*\n\n` +
                        `🌐 Trying: *${uploader.name}*`
                    );

                    console.log(
                        `[TOURL] Trying ${uploader.name}...`
                    );

                    const url = await uploader.upload();

                    if (url) {
                        finalUrl = url;
                        usedHost = uploader.name;
                        break;
                    }

                } catch (error) {
                    const reason =
                        error.response?.data ||
                        error.message ||
                        'Unknown error';

                    console.error(
                        `[TOURL] ${uploader.name} failed:`,
                        reason
                    );

                    failures.push(
                        `${uploader.name}: ${String(reason).slice(0, 100)}`
                    );
                }
            }

            if (!finalUrl) {
                await m.react('❌');

                return editMessage(
                    sock,
                    m,
                    loading,
                    `❌ *All upload services failed.*\n\n` +
                    `Tried:\n` +
                    `• Catbox ❌\n` +
                    `• Uguu ❌\n` +
                    `• 0x0.st ❌\n\n` +
                    `Please try again later.`
                );
            }

            await m.react('✅');

            const result =
                `╭━━〔 🥶 FREEZER-MD 〕━━╮\n` +
                `┃ 📤 *MEDIA UPLOADED*\n` +
                `┃\n` +
                `┃ 🌐 Host: ${usedHost}\n` +
                `┃ 📁 File: ${filename}\n` +
                `┃ 📦 Type: ${mime}\n` +
                `┃ 📏 Size: ${sizeMB} MB\n` +
                `┃\n` +
                `┃ 🔗 *PUBLIC URL:*\n` +
                `┃ ${finalUrl}\n` +
                `╰━━━━━━━━━━━━━━━━╯`;

            return editMessage(
                sock,
                m,
                loading,
                result
            );

        } catch (error) {
            console.error(
                'Freezer-MD TOURL fatal error:',
                error
            );

            await m.react('❌');

            return m.reply(
                '❌ Unexpected error while processing the upload.'
            );
        }
    }
};

async function editMessage(sock, m, message, text) {
    try {
        return await sock.sendMessage(
            m.from,
            {
                text,
                edit: message.key
            }
        );
    } catch (error) {
        return await sock.sendMessage(
            m.from,
            { text }
        );
    }
}
