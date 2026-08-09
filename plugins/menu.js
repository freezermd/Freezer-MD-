const axios = require('axios');

module.exports = {
    name: 'menu',
    hidden: true,
    description: 'Show available bot commands',
    aliases: ['help', 'cmdlist', 'commands'],

    async execute(sock, m) {    
        const prefix = global.BOT_PREFIX || '.';    
        const now = new Date();
        
        const date = now.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            timeZone: 'Africa/Accra'
        });
        
        const time = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true,
            timeZone: 'Africa/Accra'
        });
        
        const botOwner = global.ownerName || 'FREEZER MD';
        const user = m.pushName || m.sender?.split('@')[0] || 'User';

        const uptimeSec = process.uptime();
        const uh = Math.floor(uptimeSec / 3600);
        const um = Math.floor((uptimeSec % 3600) / 60);
        const us = Math.floor(uptimeSec % 60);
        const uptimeStr = `${uh}h ${um}m ${us}s`;

        const ramStr = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;

        // Dynamic Command Categories Generator
        const CATEGORY_ORDER = ['General', 'Downloaders', 'Tools', 'AI', 'Fun', 'Group', 'Status', 'Channel', 'Admin'];
        const CATEGORY_ICONS = {
            General: '⚡', Downloaders: '📥', Tools: '🛠️', AI: '🤖', Fun: '🎮',
            Group: '🛡️', Status: '📊', Channel: '📢', Admin: '🔑'
        };

        const grouped = {};
        const seen = new Set();
        let totalPlugins = 0;

        if (global.plugins instanceof Map) {
            const uniquePlugins = new Set(global.plugins.values());
            totalPlugins = uniquePlugins.size;

            for (const plugin of global.plugins.values()) {
                if (!plugin || !plugin.name) continue;
                if (plugin.hidden) continue;
                if (seen.has(plugin.name)) continue;
                seen.add(plugin.name);

                const category = plugin.category || 'General';
                if (!grouped[category]) grouped[category] = [];
                grouped[category].push(`${prefix}${plugin.name}`);
            }
        }

        const allCategories = [
            ...CATEGORY_ORDER.filter(c => grouped[c]),
            ...Object.keys(grouped).filter(c => !CATEGORY_ORDER.includes(c))
        ];

        const commandSections = allCategories.map(category => {
            const icon = CATEGORY_ICONS[category] || '📁';
            const commands = grouped[category].map(cmd => `║  ⭓ \`${cmd}\``).join('\n');
            return `╔══════════════════════════╗\n║ ${icon} *${category.toUpperCase()}*\n╠══════════════════════════╣\n${commands}\n╚══════════════════════════╝`;
        }).join('\n\n');

        const menuText = `
╔══════════════════════════╗
║   🧊 *FREEZER MD BOT* 🧊   
╠══════════════════════════╣
║ 👤 *Owner:* ${botOwner}
║ 🙋 *User:* @${m.sender?.split('@')[0] || user}
║ 🚀 *Plugins:* ${totalPlugins}
║ ⏱️ *Uptime:* ${uptimeStr}
║ 💾 *RAM:* ${ramStr}
║ 📅 *Date:* ${date}
║ ⏰ *Time:* ${time}
║ 🔧 *Prefix:* [ ${prefix} ]
╚══════════════════════════╝

${commandSections}

> ❄️ *Powered by Freezer MD*
`.trim();

        const contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363426778975572@newsletter',
                newsletterName: '🧊 FREEZER MD 🧊',
                serverMessageId: 1
            }
        };

        try {    
            if (!global.menuImage) throw new Error('global.menuImage is not set');

            const response = await axios.get(global.menuImage, {
                responseType: 'arraybuffer',
                timeout: 8000
            });
            const imageBuffer = Buffer.from(response.data);
            
            await m.reply(imageBuffer, { 
                caption: menuText,
                contextInfo
            });
            
        } catch (err) {    
            console.error('Menu image error, falling back to text:', err.message);
            try {
                await m.reply(menuText, { contextInfo });
            } catch (err2) {
                console.error('Menu fallback error:', err2.message);
            }
        }    
    }
};
