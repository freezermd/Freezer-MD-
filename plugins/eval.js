const vm = require('vm');
const util = require('util');

function formatResult(value) {
    if (typeof value === 'string') return value;
    return util.inspect(value, {
        depth: 4,
        maxArrayLength: 100,
        maxStringLength: 10000,
        breakLength: 120
    });
}

module.exports = {
    name: 'eval',
    category: 'Owner',
    aliases: ['ev', 'evaluate'],
    description: 'Evaluate JavaScript code (owner only)',

    async execute(sock, m, args) {
        if (!m.isOwner) return m.reply('❌ Owner only.');

        const code = args.join(' ').trim();
        if (!code) {
            return m.reply(
                '🧪 *Usage:* .eval <JavaScript>\n\n' +
                'Example:\n.eval 2 + 2'
            );
        }

        try {
            const sandbox = {
                sock,
                m,
                args,
                global,
                console,
                Buffer,
                process,
                require,
                setTimeout,
                clearTimeout,
                setInterval,
                clearInterval
            };

            const context = vm.createContext(sandbox);
            const script = new vm.Script(`(async () => (${code}))()`, {
                filename: 'freezer-eval.js'
            });

            const result = await script.runInContext(context, {
                timeout: 10000
            });

            const output = formatResult(result);
            return m.reply(
                `🧪 *EVAL RESULT*\n\n` +
                `\`\`\`js\n${output.slice(0, 12000)}\n\`\`\``
            );
        } catch (err) {
            return m.reply(
                `❌ *EVAL ERROR*\n\n` +
                `\`\`\`js\n${String(err.stack || err).slice(0, 12000)}\n\`\`\``
            );
        }
    }
};
