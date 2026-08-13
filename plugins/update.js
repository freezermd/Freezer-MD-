const { execFile } = require('child_process');

function runGit(args) {
    return new Promise((resolve, reject) => {
        execFile('git', args, {
            cwd: process.cwd(),
            timeout: 120000,
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
    name: 'update',
    category: 'Owner',
    aliases: ['gitpull', 'upgrade'],
    description: 'Update Freezer-MD from GitHub',

    async execute(sock, m) {
        if (!m.isOwner) return m.reply('❌ Owner only.');

        const loading = await m.reply('🔄 *Checking Freezer-MD for updates...*');

        try {
            const before = (await runGit(['rev-parse', '--short', 'HEAD'])).stdout.trim();

            const result = await runGit(['pull', '--ff-only', 'origin', 'main']);

            const after = (await runGit(['rev-parse', '--short', 'HEAD'])).stdout.trim();
            const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim();

            if (before === after) {
                return sock.sendMessage(m.from, {
                    text:
                        `╭─〔 🥶 FREEZER-MD UPDATE 〕─╮\n` +
                        `│\n` +
                        `│ ✅ Already up to date.\n` +
                        `│ 📌 Commit: ${after}\n` +
                        `│\n` +
                        `╰────────────────────────╯`,
                    edit: loading.key
                });
            }

            await sock.sendMessage(m.from, {
                text:
                    `╭─〔 🥶 FREEZER-MD UPDATE 〕─╮\n` +
                    `│\n` +
                    `│ ✅ Update downloaded.\n` +
                    `│ 🔹 Before: ${before}\n` +
                    `│ 🔹 After: ${after}\n` +
                    `│\n` +
                    `│ 🔄 Restarting...\n` +
                    `╰────────────────────────╯`,
                edit: loading.key
            });

            console.log('Freezer-MD update output:', output);

            setTimeout(() => process.exit(0), 1500);
        } catch (err) {
            console.error('Update error:', err);

            const details = String(err.stderr || err.message || 'Unknown error')
                .trim()
                .slice(0, 1200);

            try {
                await sock.sendMessage(m.from, {
                    text:
                        `❌ *Update failed*\n\n` +
                        `\`\`\`\n${details}\n\`\`\`\n\n` +
                        `No changes were intentionally reset.`,
                    edit: loading.key
                });
            } catch {
                await m.reply(`❌ Update failed:\n${details}`);
            }
        }
    }
};
