require('./config')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, generateWAMessageContent, generateWAMessageFromContent, generateMessageID, prepareWAMessageMedia, fetchLatestWaWebVersion, proto, generateProfilePicture, getContentType } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const http = require('http');
const QRCode = require('qrcode');
const { Boom } = require('@hapi/boom');
const serializeMessage = require('./handler.js');
const { decodeSessionId } = require('./lib/sessionLoader');
const { AntideleteHandler } = require('./lib/antidelete');
const { handleChatbotResponse } = require('./lib/chatbot');
const { handleLinkDetection } = require('./lib/antilink');
const JimpImport = require('jimp');

const Jimp =
  JimpImport.read
    ? JimpImport
    : JimpImport.Jimp
    ? JimpImport.Jimp
    : JimpImport.default;

global.generateWAMessageContent = generateWAMessageContent;
global.generateWAMessageFromContent = generateWAMessageFromContent;
global.generateMessageID = generateMessageID;
global.prepareWAMessageMedia = prepareWAMessageMedia;
global.proto = proto;
global.Jimp = Jimp;
global.generateProfilePicture = generateProfilePicture;
global.downloadMediaMessage = downloadMediaMessage;
global.bannedChats = global.bannedChats || [];

if (!fs.existsSync(__dirname + '/session/creds.json') && global.sessionid) {
    const result = decodeSessionId(global.sessionid);
    if (result.ok) {
        try {
            fs.mkdirSync(__dirname + '/session', { recursive: true });
            fs.writeFileSync(__dirname + '/session/creds.json', result.data);
            console.log('✅ Session restored from SESSION_ID');
        } catch (err) {
            console.error('Error writing restored session:', err.message);
        }
    } else {
        console.error('❌ Failed to restore session from SESSION_ID:', result.reason);
    }
}

const AUTH_FOLDER = './session';
const PLUGIN_FOLDER = './plugins';
const PORT = process.env.PORT || 3000;

let latestQR = '';
let botStatus = 'disconnected';
let pairingCodes = new Map();
let presenceInterval = null;
let sock = null;
let isConnecting = false;
let lastStatusReactTime = 0;

function loadPrefix() {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.prefix) global.BOT_PREFIX = config.prefix;
        } catch (err) {
            console.error('Error loading config:', err);
        }
    }
    startBot();
}

function startBot() {
    isConnecting = true;

    if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, { recursive: true });

    (async () => {
        try {
            const { version } = await fetchLatestWaWebVersion();
            const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

            sock = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                auth: state,
                printQRInTerminal: true,
                keepAliveIntervalMs: 10000,
                markOnlineOnConnect: true,
                syncFullHistory: false,
                browser: ['Bot', 'Chrome', '1.0.0']
            });

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    QRCode.toDataURL(qr, (err, url) => { if (!err) latestQR = url; });
                }

                if (connection === 'close') {
                    botStatus = 'disconnected';
                    isConnecting = false;

                    if (presenceInterval) {
                        clearInterval(presenceInterval);
                        presenceInterval = null;
                    }

                    const statusCode = (lastDisconnect?.error instanceof Boom)
                        ? lastDisconnect.error.output.statusCode
                        : 0;

                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                    if (shouldReconnect) {
                        setTimeout(() => startBot(), 5000);
                    } else {
                        if (fs.existsSync(AUTH_FOLDER)) fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
                        setTimeout(() => startBot(), 3000);
                    }
                }

                else if (connection === 'open') {
                    botStatus = 'connected';
                    isConnecting = false;

                    if (!global.owners) global.owners = [];
                    if (!global.owners.includes(sock.user.id)) global.owners.push(sock.user.id);

                    presenceInterval = setInterval(() => {
                        if (sock?.ws?.readyState === 1) sock.sendPresenceUpdate('available');
                    }, 10000);

                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // Strip :device suffix so the DM lands on the right JID
                    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

                    try {
                        await sock.newsletterFollow('120363426778975572@newsletter');
                    } catch (err) {}

                    try {
                        await sock.sendMessage(botNumber, {
                            text: `🤖 Bot Connected Successfully!\n\n⏰ Time: ${new Date().toLocaleString()}\n✅ Status: Online and Ready!\n📝 Prefix: ${global.BOT_PREFIX}\n👑 Owners: ${global.owners.length}\n\n✅ JOIN FREEZER MD CHANNEL`,
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363426778975572@newsletter',
                                    newsletterName: '🟣FREEZER🟣',
                                    serverMessageId: -1
                                }
                            }
                        });
                    } catch (err) {
                        console.log('❌ Connection message error:', err.message);
                    }
                }

                else if (connection === 'connecting') {
                    botStatus = 'connecting';
                    isConnecting = true;
                }
            });

            sock.ev.on('creds.update', saveCreds);

            const plugins = new Map();
            const pluginPath = path.join(__dirname, PLUGIN_FOLDER);

            if (fs.existsSync(pluginPath)) {
                try {
                    const pluginFiles = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js'));

                    for (const file of pluginFiles) {
                        try {
                            const plugin = require(path.join(pluginPath, file));
                            if (plugin.name && typeof plugin.execute === 'function') {
                                plugins.set(plugin.name.toLowerCase(), plugin);
                                if (Array.isArray(plugin.aliases)) {
                                    plugin.aliases.forEach(alias => plugins.set(alias.toLowerCase(), plugin));
                                }
                            } else {
                                console.warn(`⚠️ Invalid plugin structure in ${file}`);
                            }
                        } catch (error) {
                            console.error(`❌ Failed to load plugin ${file}:`, error.message);
                        }
                    }
                    global.plugins = plugins;
                } catch (error) {
                    console.error('❌ Error loading plugins:', error);
                }
            }

            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type !== 'notify' && type !== 'append') return;

                const CHANNEL_ID = "120363426778975572@newsletter";

                for (const rawMsg of messages) {
                    if (rawMsg.key?.remoteJid === CHANNEL_ID && rawMsg.key?.server_id) {
                        const emojis = ["❤️", "💛", "👍", "💜", "😮", "🤍", "💙", "🔥", "💯", "⚡"];
                        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

                        try {
                            await sock.newsletterReactMessage(CHANNEL_ID, rawMsg.key.server_id.toString(), emoji);
                        } catch (err) {
                            console.log("❌ Channel React Error:", err.message);
                        }
                        continue;
                    }
                }

                for (const rawMsg of messages) {
                    if (rawMsg.key.remoteJid === 'status@broadcast' && rawMsg.key.participant) {
                        if (global.autoView) {
                            try {
                                await sock.readMessages([rawMsg.key]);
                            } catch (err) {
                                console.log('❌ Status viewer error:', err.message);
                            }
                        }

                        if (global.autoLike) {
                            try {
                                const now = Date.now();
                                if (now - lastStatusReactTime < (global.statusReactThrottleMs ?? 5000)) {
                                    // throttled
                                } else {
                                    // WhatsApp sometimes reports the poster as @lid instead of @s.whatsapp.net;
                                    // status reactions silently fail if sent to an @lid, so resolve the real JID.
                                    let realJid = rawMsg.key.participant;
                                    if (realJid.endsWith('@lid')) {
                                        const rawPn = rawMsg.key?.participantPn || rawMsg.key?.senderPn || rawMsg.participantPn;
                                        if (rawPn) {
                                            realJid = rawPn.includes('@') ? rawPn : `${rawPn}@s.whatsapp.net`;
                                        } else if (typeof sock.getJidFromLid === 'function') {
                                            const resolved = await sock.getJidFromLid(realJid).catch(() => null);
                                            if (resolved) realJid = resolved;
                                        }
                                    }

                                    const resolvedKey = {
                                        remoteJid: 'status@broadcast',
                                        id: rawMsg.key.id,
                                        participant: realJid
                                    };

                                    const contentType = getContentType(rawMsg.message);
                                    const reactable = ['imageMessage', 'videoMessage', 'extendedTextMessage', 'conversation', 'audioMessage'];

                                    if (reactable.includes(contentType)) {
                                        const emojis = ["❤️", "🩶", "🔥", "🤍", "♦️", "🎉", "💚", "💯", "✨", "😍", "🎊"];
                                        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                                        const botId = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : sock.user?.id;

                                        await sock.sendMessage('status@broadcast',
                                            { react: { text: emoji, key: resolvedKey } },
                                            { statusJidList: [realJid, botId].filter(Boolean) }
                                        );

                                        lastStatusReactTime = Date.now();
                                        await new Promise(resolve => setTimeout(resolve, global.statusReactDelayMs ?? 2000));
                                    }
                                }
                            } catch (err) {
                                console.log('❌ Status like error:', err.message);
                            }
                        }

                        continue;
                    }
                }

                for (const rm of messages) {
                    AntideleteHandler(sock, rm).catch(err => console.error('Antidelete hook error:', err.message));
                }

                const rawMsg = messages[0];
                if (!rawMsg.message) return;

                const m = await serializeMessage(sock, rawMsg);

                if (global.autoRead) {
                    try { await sock.readMessages([rawMsg.key]); } catch (err) {}
                }

                if (global.presenceMode && global.presenceMode !== 'none' && m.from) {
                    try {
                        if (global.presenceMode === 'typing') await sock.sendPresenceUpdate('composing', m.from);
                        else if (global.presenceMode === 'recording') await sock.sendPresenceUpdate('recording', m.from);
                        else if (global.presenceMode === 'online') await sock.sendPresenceUpdate('available', m.from);
                    } catch (err) {}
                }

                if (m.isGroup && !rawMsg.key.fromMe) {
                    handleChatbotResponse(sock, m.from, rawMsg, m.body || '', m.sender)
                        .catch(err => console.error('Chatbot hook error:', err.message));

                    const isExempt = m.isAdmin || m.isOwner || m.isDev;
                    handleLinkDetection(sock, m.from, rawMsg, m.body || '', m.sender, isExempt)
                        .catch(err => console.error('Antilink hook error:', err.message));
                }

                for (const plugin of plugins.values()) {
                    if (typeof plugin.onMessage === 'function') {
                        try {
                            const blocked = await plugin.onMessage(sock, m);
                            if (blocked === true) return;
                        } catch (err) {
                            console.error(`❌ onMessage error (${plugin.name}):`, err);
                        }
                    }
                }

                if (m.body && m.body.startsWith(global.BOT_PREFIX)) {
                    const args = m.body.slice(global.BOT_PREFIX.length).trim().split(/\s+/);
                    const commandName = args.shift().toLowerCase();
                    const plugin = plugins.get(commandName);

                    if (plugin) {
                        try {
                            await plugin.execute(sock, m, args);
                        } catch (err) {
                            console.error(`❌ Plugin error (${commandName}):`, err);
                            await m.reply('❌ Error running command.');
                        }
                    }
                }
            });

            sock.ev.on('group-participants.update', async (update) => {
                try {
                    if (!global.welcomeConfig?.enabled) return;

                    const groupId = update.id;

                    for (const participant of update.participants) {
                        const userId = typeof participant === 'string'
                            ? participant
                            : participant.phoneNumber || participant.id;

                        if (!userId) continue;

                        const memberName = userId.split('@')[0];

                        if (update.action === 'add') {
                            if (userId === sock.user.id) continue;

                            await sock.sendMessage(groupId, {
                                text: `👋 Welcome @${memberName}!\n🎉 Glad to have you in this group!`,
                                mentions: [userId]
                            });

                        } else if (update.action === 'remove') {
                            await sock.sendMessage(groupId, {
                                text: `ya @${memberName} has left the group.\nWe are not gonna miss you!`,
                                mentions: [userId]
                            });
                        }
                    }
                } catch (err) {
                    console.error('❌ group-participants.update error:', err);
                }
            });

        } catch (error) {
            console.error('❌ Bot startup error:', error);
            isConnecting = false;
            setTimeout(() => startBot(), 10000);
        }
    })();
}

function collectRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 1e6) {
                req.destroy();
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    const url = req.url;

    if (url === '/' || url === '/qr') {
        res.writeHead(200, { 'Content
