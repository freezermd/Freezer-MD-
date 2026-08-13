module.exports = {
    name: 'listplugins',
    category: 'Owner',
    aliases: ['plugins', 'pluginlist'],
    description: 'List loaded Freezer-MD plugins',

    async execute(sock, m) {
        if (!m.isOwner) return m.reply('❌ Owner only.');

        const plugins = global.plugins;

        if (!(plugins instanceof Map)) {
            return m.reply('❌ Plugin registry is not available.');
        }

        const unique = new Map();

        for (const plugin of plugins.values()) {
            if (!plugin?.name) continue;
            unique.set(plugin.name.toLowerCase(), plugin);
        }

        const sorted = [...unique.values()].sort((a, b) =>
            String(a.name).localeCompare(String(b.name))
        );

        const grouped = {};

        for (const plugin of sorted) {
            const category = plugin.category || 'General';
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(plugin);
        }

        let text =
            `╭─〔 🥶 FREEZER-MD PLUGINS 〕─╮\n` +
            `│ 📦 Total: ${sorted.length}\n` +
            `╰──────────────────────────╯\n\n`;

        for (const category of Object.keys(grouped).sort()) {
            text += `╭─〔 ${category.toUpperCase()} 〕\n`;

            for (const plugin of grouped[category]) {
                const aliases = Array.isArray(plugin.aliases) && plugin.aliases.length
                    ? ` | ${plugin.aliases.join(', ')}`
                    : '';

                text += `│ • .${plugin.name}${aliases}\n`;
            }

            text += `╰──────────────\n\n`;
        }

        return m.reply(text.trim());
    }
};
