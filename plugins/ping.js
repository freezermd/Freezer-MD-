module.exports = {
    name: 'ping',
    category: 'General',
    aliases: ['pong', 'latency'],
    description: 'Check bot response speed and connection health',

    async execute(sock, m) {
        const start = Date.now();

        const loading = await m.reply(
`╭─〔 🧊 FREEZER MD 〕─╮
│ ❄️ Pinging...
╰────────────────╯`
        );

        let wsPing = 'N/A';

        if (sock.ws?.ping !== undefined) {
            wsPing = `${sock.ws.ping} ms`;
        } else if (sock.ws?._socket?._pingRTT !== undefined) {
            wsPing = `${sock.ws._socket._pingRTT} ms`;
        }

        const latency = Date.now() - start;

        const totalSeconds = Math.floor(process.uptime());
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const uptime = [
            days ? `${days}d` : '',
            hours ? `${hours}h` : '',
            minutes ? `${minutes}m` : '',
            `${seconds}s`
        ].filter(Boolean).join(' ');

        const status =
            latency < 200 ? '🟢 Excellent' :
            latency < 500 ? '🟡 Stable' :
            '🔴 Slow';

        const info =
`╭─〔 🧊 FREEZER MD 〕─╮
│
│ ⚡ ${status}
│ 🚀 ${latency} ms
│ 📡 ${wsPing}
│ ⏱️ ${uptime}
│
╰─〔 ❄️ ONLINE 〕─╯`;

        try {
            await sock.sendMessage(m.from, {
                text: info,
                edit: loading.key
            });
        } catch (error) {
            console.error('Ping edit error:', error);

            await sock.sendMessage(m.from, {
                text: `🧊 *FREEZER MD*\n⚡ ${latency} ms`
            });
        }
    }
};
