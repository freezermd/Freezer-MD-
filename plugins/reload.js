const fs = require('fs');
const path = require('path');

function loadPlugins() {
    const pluginDir = path.join(process.cwd(), 'plugins');

    if (!fs.existsSync(pluginDir)) {
        throw new Error('plugins directory not found');
    }

    if (!(global.plugins instanceof Map)) {
        global.plugins = new Map();
    }

    const registry = global.plugins;
    registry.clear();

    const files = fs.readdirSync(pluginDir)
        .filter(file => file.endsWith('.js'))
        .sort();

    let loaded = 0;
    let failed = 0;
    const errors = [];

    for (const file of files) {
        const fullPath = path.join(pluginDir, file);

        try {
            delete require.cache[require.resolve(fullPath)];
            const plugin = require(fullPath);

            if (!plugin?.name || typeof plugin.execute !== 'function') {
                failed++;
                errors.push(`${file}: invalid plugin structure`);
                continue;
            }

            registry.set(String(plugin.name).toLowerCase(), plugin);

            if (Array.isArray(plugin.aliases)) {
                for (const alias of plugin.aliases) {
                    if (!alias) continue;
                    registry.set(String(alias).toLowerCase(), plugin);
                }
            }

            loaded++;
        } catch (err) {
            failed++;
            errors.push(`${file}: ${err.message}`);
        }
    }

    return { files: files.length, loaded, failed, errors };
}

module.exports = {
    name: 'reload',
    category: 'Owner',
    aliases: ['reloadplugins', 'refresh'],
    description: 'Reload all plugins without restarting the bot',

    async execute(sock, m) {
        if (!m.isOwner) return m.reply('❌ Owner only.');

        try {
            const result = loadPlugins();

            let text =
                `╭─〔 🔄 FREEZER-MD RELOAD 〕─╮\n` +
                `│\n` +
                `│ 📦 Files: ${result.files}\n` +
                `│ ✅ Loaded: ${result.loaded}\n` +
                `│ ❌ Failed: ${result.failed}\n`;

            if (result.errors.length) {
                text += `│\n│ *Errors:*\n`;

                for (const error of result.errors.slice(0, 10)) {
                    text += `│ • ${error}\n`;
                }
            }

            text += `│\n╰────────────────────────╯`;

            return m.reply(text);
        } catch (err) {
            console.error('Reload error:', err);
            return m.reply(`❌ Plugin reload failed:\n${err.message}`);
        }
    }
};
