const axios = require("axios");
const yts = require("yt-search");

const newsletterContext = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363426778975572@newsletter',
            newsletterName: 'FREEZER-MD',
            serverMessageId: 1
        }
    }
};

function formatDuration(seconds) {
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor(seconds / 3600);

    return h > 0
        ? `${h}h ${m}m ${s}s`
        : `${m}m ${s}s`;
}

function normalizeJid(jid) {
    if (!jid) return jid;

    const [number, server] = jid.split('@');

    if (!server) return jid;

    return number.split(':')[0] + '@' + server;
}

module.exports = {
    name: 'play',
    category: 'Downloader',
    aliases: ['song', 'yta', 'ytmp3'],
    description: 'Search/download audio from YouTube',

    async execute(sock, m, args) {

        const query = args.join(' ').trim();

        if (!query) {
            return m.reply(
                '❌ *Usage:* .play <YouTube link or search term>'
            );
        }

        const loadingMsg = await m.reply(
            '🔎 *Freezer-MD is fetching audio...*'
        );

        // ─────────────────────────────
        // SEARCH YOUTUBE
        // ─────────────────────────────

        const isUrl =
            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(query);

        let videoUrl = query;

        if (!isUrl) {
            try {
                const searchResult = await yts(query);
                const video = searchResult?.videos?.[0];

                if (!video) {
                    await editMessage(
                        sock,
                        m.from,
                        loadingMsg,
                        `❌ *No results found for:*\n${query}`
                    );
                    return;
                }

                videoUrl = video.url;

            } catch (err) {

                console.error('play.js yt-search error:', err);

                await editMessage(
                    sock,
                    m.from,
                    loadingMsg,
                    '❌ *YouTube search failed.*'
                );

                return;
            }
        }

        // ─────────────────────────────
        // DOWNLOAD API
        // ─────────────────────────────

        let data;

        try {

            const apiUrl =
                `https://jerrycoder.oggyapi.workers.dev/down/ytmp3?url=${encodeURIComponent(videoUrl)}`;

            const { data: res } = await axios.get(
                apiUrl,
                {
                    timeout: 30000
                }
            );

            if (
                !res ||
                res.status !== 'success' ||
                !res.url
            ) {
                throw new Error(
                    'API returned an unsuccessful response'
                );
            }

            data = res;

        } catch (err) {

            console.error(
                'play.js fetch error:',
                err.message
            );

            await editMessage(
                sock,
                m.from,
                loadingMsg,
                '❌ *Failed to fetch audio.*\n\nThe YouTube link may be invalid or the download service may be unavailable.'
            );

            return;
        }

        // ─────────────────────────────
        // FORMAT SELECTION
        // ─────────────────────────────

        const durationStr = data.duration
            ? formatDuration(data.duration)
            : 'N/A';

        const caption =
`🥶 *FREEZER-MD MUSIC DOWNLOADER*

🎧 *${data.title}*

⏱️ *Duration:* ${durationStr}
🔊 *Quality:* ${data.quality || 'N/A'}
🛠️ *Source:* ${data.creator || 'YouTube'}

━━━━━━━━━━━━━━━━━━

Reply with a number:

*1* — 🎵 Audio
*2* — 🎙️ Voice Note
*3* — 📁 Document

⏳ *Selection expires in 60 seconds.*

> 🥶 FREEZER-MD`;

        await editMessage(
            sock,
            m.from,
            loadingMsg,
            caption
        );

        // ─────────────────────────────
        // WAIT FOR USER SELECTION
        // ─────────────────────────────

        const chatId = m.from;

        const senderId = normalizeJid(
            m.sender ||
            m.key?.participant ||
            m.key?.remoteJid
        );

        await new Promise((resolve) => {

            let settled = false;

            const cleanup = () => {

                if (settled) return;

                settled = true;

                clearTimeout(timer);

                try {

                    if (typeof sock.ev.off === 'function') {

                        sock.ev.off(
                            'messages.upsert',
                            listener
                        );

                    } else if (
                        typeof sock.ev.removeListener === 'function'
                    ) {

                        sock.ev.removeListener(
                            'messages.upsert',
                            listener
                        );
                    }

                } catch (err) {

                    console.error(
                        'play.js listener cleanup:',
                        err
                    );
                }

                resolve();
            };

            const timer = setTimeout(
                async () => {

                    if (settled) return;

                    cleanup();

                    await sock.sendMessage(
                        chatId,
                        {
                            text:
                                '⌛ *Format selection timed out.*\n\nRun *.play* again.'
                        }
                    ).catch(() => {});

                },
                60000
            );

            const listener = async ({ messages }) => {

                if (settled) return;

                for (const msg of messages) {

                    if (!msg.message) continue;
                    if (msg.key?.fromMe) continue;

                    if (
                        msg.key?.remoteJid !== chatId
                    ) {
                        continue;
                    }

                    const msgSender =
                        normalizeJid(
                            msg.key?.participant ||
                            msg.key?.remoteJid
                        );

                    if (msgSender !== senderId) {
                        continue;
                    }

                    const text =
                        (
                            msg.message.conversation ||
                            msg.message.extendedTextMessage?.text ||
                            ''
                        ).trim();

                    if (!['1', '2', '3'].includes(text)) {
                        continue;
                    }

                    cleanup();

                    // ─────────────────────
                    // DOWNLOAD AUDIO
                    // ─────────────────────

                    try {

                        const audioResp =
                            await axios.get(
                                data.url,
                                {
                                    responseType:
                                        'arraybuffer',
                                    timeout: 60000
                                }
                            );

                        const buffer =
                            Buffer.from(
                                audioResp.data
                            );

                        const safeTitle =
                            String(
                                data.title ||
                                'Freezer-MD Audio'
                            )
                                .replace(
                                    /[\\/:*?"<>|]/g,
                                    ''
                                );

                        // ─────────────────
                        // AUDIO
                        // ─────────────────

                        if (text === '1') {

                            await sock.sendMessage(
                                chatId,
                                {
                                    audio: buffer,
                                    mimetype:
                                        'audio/mpeg',
                                    fileName:
                                        `${safeTitle}.mp3`,
                                    ...newsletterContext
                                }
                            );
                        }

                        // ─────────────────
                        // VOICE NOTE
                        // ─────────────────

                        else if (text === '2') {

                            await sock.sendMessage(
                                chatId,
                                {
                                    audio: buffer,
                                    mimetype:
                                        'audio/ogg; codecs=opus',
                                    ptt: true,
                                    ...newsletterContext
                                }
                            );
                        }

                        // ─────────────────
                        // DOCUMENT
                        // ─────────────────

                        else {

                            await sock.sendMessage(
                                chatId,
                                {
                                    document: buffer,
                                    mimetype:
                                        'audio/mpeg',
                                    fileName:
                                        `${safeTitle}.mp3`,
                                    caption:
                                        `📁 *${safeTitle}*\n\n` +
                                        `🥶 *FREEZER-MD*`,
                                    ...newsletterContext
                                }
                            );
                        }

                    } catch (err) {

                        console.error(
                            'play.js delivery error:',
                            err
                        );

                        await sock.sendMessage(
                            chatId,
                            {
                                text:
                                    '❌ *Failed to send the audio file.*\n\nPlease try again later.',
                                ...newsletterContext
                            }
                        ).catch(() => {});
                    }

                    return;
                }
            };

            sock.ev.on(
                'messages.upsert',
                listener
            );
        });
    }
};

// ─────────────────────────────────
// EDIT MESSAGE HELPER
// ─────────────────────────────────

async function editMessage(
    sock,
    chatId,
    message,
    text
) {

    try {

        return await sock.sendMessage(
            chatId,
            {
                text,
                edit: message.key,
                ...newsletterContext
            }
        );

    } catch (err) {

        console.error(
            'play.js edit error:',
            err.message
        );

        return await sock.sendMessage(
            chatId,
            {
                text,
                ...newsletterContext
            }
        );
    }
}
