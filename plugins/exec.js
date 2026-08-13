const { execFile } = require('child_process');

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        execFile(command, args, {
            cwd: process.cwd(),
            timeout: 30000,
            maxBuffer: 1024 * 1024
        }, (error, stdout, stderr) => {
            if (error) {
                error.stdout = stdout;
                error.stderr = stderr;
                return reject(error);
            }
            resolve({ stdout, stderr });
        });
    });
}

module.exports = {
    name: 'exec',
    category: 'Owner',
    aliases: ['shell', 'cmd'],
    description: 'Run an operating-system command (owner only)',

    async execute(sock, m, args) {
        if (!m.isOwner) return m.reply('❌ Owner only.');

        if (!args.length) {
            return m.reply(
                '💻 *Usage:* .exec <command> [arguments]\n\n' +
                'Examples:\n' +
                '.exec node --version\n' +
                '.exec git status'
            );
        }

        // Deliberately uses execFile instead of a shell string.
        // This avoids shell interpretation and makes arguments explicit.
        const command = args[0];
        const commandArgs = args.slice(1);

        const allowedCommands = new Set([
            'node',
            'npm',
            'npx',
            'git',
            'pm2',
            'pwd',
            'whoami',
            'uname',
            'uptime'
        ]);

        if (!allowedCommands.has(command)) {
            return m.reply(
                `❌ Command not allowed.\n\n` +
                `Allowed: ${[...allowedCommands].join(', ')}`
            );
        }

        try {
            const result = await runCommand(command, commandArgs);
            const output = `${result.stdout || ''}${result.stderr ? `\n${result.stderr}` : ''}`.trim();

            return m.reply(
                `💻 *EXEC RESULT*\n\n` +
                `\`\`\`\n${(output || '(no output)').slice(0, 12000)}\n\`\`\``
            );
        } catch (err) {
            const output = `${err.stdout || ''}${err.stderr ? `\n${err.stderr}` : ''}`.trim();

            return m.reply(
                `❌ *EXEC ERROR*\n\n` +
                `\`\`\`\n${(output || err.message || 'Command failed').slice(0, 12000)}\n\`\`\``
            );
        }
    }
};
