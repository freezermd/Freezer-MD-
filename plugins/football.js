const axios = require('axios');

const API_BASE = 'https://v3.football.api-sports.io';
const TZ = 'Africa/Nairobi';

const EPL_ID = 39;

// ─────────────────────────────────────────────
// API CLIENT
// ─────────────────────────────────────────────

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: {
        'x-apisports-key': process.env.FOOTBALL_API_KEY || '',
        'Accept': 'application/json'
    }
});

// Optional football news API
const newsApi = process.env.FOOTBALL_NEWS_API_KEY
    ? axios.create({
        baseURL: 'https://newsapi.org/v2',
        timeout: 10000,
        params: {
            apiKey: process.env.FOOTBALL_NEWS_API_KEY
        }
    })
    : null;


// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getDateNairobi(offset = 0) {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const parts = formatter.formatToParts(now);

    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    date.setDate(date.getDate() + offset);

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');
}


function formatTimeNairobi(dateString) {
    if (!dateString) return 'TBD';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return 'TBD';
    }

    return new Intl.DateTimeFormat('en-KE', {
        timeZone: TZ,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
}


function formatDateNairobi(dateString) {
    if (!dateString) return 'TBD';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return 'TBD';
    }

    return new Intl.DateTimeFormat('en-KE', {
        timeZone: TZ,
        day: '2-digit',
        month: 'short'
    }).format(date);
}


// FREEZER MD box
function box(title, lines = []) {

    const content = lines.map(line => {

        let clean = String(line);

        // Prevent duplicated │
        clean = clean.replace(/^│\s?/, '');

        return `│ ${clean}`;

    }).join('\n');

    return [
        `╭─〔 ${title} 〕─╮`,
        content,
        `╰─〔 🧊 FREEZER MD 〕─╯`
    ].join('\n');
}


function truncate(text, max = 4000) {

    if (!text) return '';

    if (text.length <= max) {
        return text;
    }

    return text.slice(0, max - 1) + '…';
}


// ─────────────────────────────────────────────
// API REQUEST
// ─────────────────────────────────────────────

async function fetchFootball(endpoint, params = {}) {

    if (!process.env.FOOTBALL_API_KEY) {
        throw new Error(
            'FOOTBALL_API_KEY is not configured.'
        );
    }

    try {

        const response = await api.get(endpoint, {
            params
        });

        const data = response.data;

        if (
            data?.errors &&
            Object.keys(data.errors).length
        ) {

            const message =
                Object.values(data.errors).join(', ');

            throw new Error(message);
        }

        return data;

    } catch (error) {

        if (error.response?.status === 401) {
            throw new Error(
                'Football API authentication failed.'
            );
        }

        if (error.response?.status === 403) {
            throw new Error(
                'Football API access denied.'
            );
        }

        if (error.response?.status === 429) {
            throw new Error(
                'Football API rate limit reached.'
            );
        }

        if (error.code === 'ECONNABORTED') {
            throw new Error(
                'Football API request timed out.'
            );
        }

        throw error;
    }
}


// ─────────────────────────────────────────────
// CURRENT SEASON
// ─────────────────────────────────────────────

async function getCurrentSeason(leagueId = EPL_ID) {

    const data = await fetchFootball('/leagues', {
        id: leagueId
    });

    const league = data?.response?.[0];

    const seasons = league?.seasons || [];

    const current = seasons.find(
        season => season.current === true
    );

    return current?.year || new Date().getFullYear();
}


// ─────────────────────────────────────────────
// HELP
// ─────────────────────────────────────────────

async function cmdHelp(prefix) {

    return box('⚽ FREEZER FOOTBALL', [

        '🔥 FOOTBALL CENTER',
        '',
        `🔴 ${prefix}football live`,
        `📅 ${prefix}football today`,
        `📆 ${prefix}football tomorrow`,
        `📋 ${prefix}football fixtures`,
        `🏆 ${prefix}football standings`,
        `🤕 ${prefix}football injuries`,
        `👥 ${prefix}football team Arsenal`,
        `👤 ${prefix}football player Messi`,
        `🎯 ${prefix}football top`,
        `📰 ${prefix}football news`,
        '',
        `ℹ️ ${prefix}football help`

    ]);
}


// ─────────────────────────────────────────────
// LIVE
// ─────────────────────────────────────────────

async function cmdLive() {

    const data = await fetchFootball('/fixtures', {
        live: 'all',
        timezone: TZ
    });

    const matches = data?.response || [];

    if (!matches.length) {

        return box('🔴 LIVE FOOTBALL', [
            '',
            'No matches are live right now.',
            '',
            'Check again later.'
        ]);
    }

    const lines = [];

    for (const match of matches.slice(0, 20)) {

        const league =
            match.league?.name || 'Unknown League';

        const home =
            match.teams?.home?.name || 'Home';

        const away =
            match.teams?.away?.name || 'Away';

        const homeScore =
            match.goals?.home ?? 0;

        const awayScore =
            match.goals?.away ?? 0;

        const elapsed =
            match.fixture?.status?.elapsed;

        const status =
            elapsed !== null &&
            elapsed !== undefined
                ? `${elapsed}'`
                : match.fixture?.status?.short || 'LIVE';

        lines.push(
            `🏆 ${league}`,
            `⚽ ${home}`,
            `   *${homeScore} - ${awayScore}*`,
            `⚽ ${away}`,
            `⏱️ ${status}`
        );

        // Match events
        const events = match.events || [];

        if (events.length) {

            const important = events
                .slice(-6)
                .reverse();

            for (const event of important) {

                let emoji = '📌';

                if (event.type === 'Goal') {
                    emoji = '⚽';
                }

                else if (event.type === 'Card') {

                    emoji =
                        event.detail === 'Red Card'
                            ? '🟥'
                            : '🟨';
                }

                else if (event.type === 'subst') {
                    emoji = '🔄';
                }

                else if (event.type === 'Var') {
                    emoji = '📹';
                }

                const player =
                    event.player?.name || 'Unknown';

                const detail =
                    event.detail || '';

                lines.push(
                    `${emoji} ${player} ${detail}`
                );
            }
        }

        lines.push('');
    }

    return box(
        '🔴 LIVE FOOTBALL',
        lines
    );
}


// ─────────────────────────────────────────────
// TODAY / TOMORROW
// ─────────────────────────────────────────────

async function cmdDate(offset = 0) {

    const date = getDateNairobi(offset);

    const data = await fetchFootball('/fixtures', {
        date,
        timezone: TZ
    });

    const matches = data?.response || [];

    const label =
        offset === 0
            ? '📅 TODAY'
            : '📆 TOMORROW';

    if (!matches.length) {

        return box(label, [
            '',
            `No fixtures found for ${date}.`
        ]);
    }

    const lines = [];

    for (const match of matches.slice(0, 30)) {

        const league =
            match.league?.name || 'Unknown League';

        const home =
            match.teams?.home?.name || 'Home';

        const away =
            match.teams?.away?.name || 'Away';

        const time =
            formatTimeNairobi(
                match.fixture?.date
            );

        const status =
            match.fixture?.status?.short || 'NS';

        lines.push(
            `🏆 ${league}`,
            `⚽ ${home} vs ${away}`,
            `⏰ ${time} 🇰🇪`,
            `📊 ${status}`,
            ''
        );
    }

    return box(label, lines);
}


// ─────────────────────────────────────────────
// UPCOMING FIXTURES
// ─────────────────────────────────────────────

async function cmdFixtures() {

    const from = getDateNairobi(0);
    const to = getDateNairobi(7);

    const data = await fetchFootball('/fixtures', {

        from,
        to,

        timezone: TZ

    });

    const matches = data?.response || [];

    if (!matches.length) {

        return box('📋 FIXTURES', [
            '',
            'No upcoming fixtures found.'
        ]);
    }

    const lines = [];

    for (const match of matches.slice(0, 20)) {

        const league =
            match.league?.name || 'Unknown';

        const home =
            match.teams?.home?.name || 'Home';

        const away =
            match.teams?.away?.name || 'Away';

        const date =
            formatDateNairobi(
                match.fixture?.date
            );

        const time =
            formatTimeNairobi(
                match.fixture?.date
            );

        lines.push(
            `🏆 ${league}`,
            `⚽ ${home} vs ${away}`,
            `📅 ${date} | ⏰ ${time}`,
            ''
        );
    }

    return box('📋 UPCOMING FIXTURES', lines);
}


// ─────────────────────────────────────────────
// EPL STANDINGS
// ─────────────────────────────────────────────

async function cmdStandings() {

    const season =
        await getCurrentSeason(EPL_ID);

    const data = await fetchFootball('/standings', {

        league: EPL_ID,
        season

    });

    const standings =
        data?.response?.[0]
            ?.league
            ?.standings?.[0] || [];

    if (!standings.length) {

        return box('🏆 EPL TABLE', [
            '',
            'Standings are currently unavailable.'
        ]);
    }

    const lines = [
        `📅 Season: ${season}`,
        ''
    ];

    for (const team of standings) {

        const position =
            team.rank || '?';

        const name =
            team.team?.name || 'Unknown';

        const played =
            team.all?.played ?? 0;

        const wins =
            team.all?.win ?? 0;

        const draws =
            team.all?.draw ?? 0;

        const losses =
            team.all?.lose ?? 0;

        const gd =
            team.goalsDiff ?? 0;

        const points =
            team.points ?? 0;

        lines.push(
            `${position}. ${name}`,
            `   P ${played} | W ${wins} | D ${draws} | L ${losses}`,
            `   GD ${gd} | ⭐ ${points} pts`,
            ''
        );
    }

    return box('🏆 EPL TABLE', lines);
}


// ─────────────────────────────────────────────
// INJURIES
// ─────────────────────────────────────────────

async function cmdInjuries() {

    const season =
        await getCurrentSeason(EPL_ID);

    const data = await fetchFootball('/injuries', {

        league: EPL_ID,
        season

    });

    const injuries =
        data?.response || [];

    if (!injuries.length) {

        return box('🤕 EPL INJURIES', [
            '',
            'No current injury reports found.'
        ]);
    }

    const lines = [
        `📅 Season: ${season}`,
        ''
    ];

    for (const item of injuries.slice(0, 20)) {

        const player =
            item.player?.name || 'Unknown';

        const team =
            item.team?.name || 'Unknown';

        const type =
            item.player?.type || 'Unavailable';

        const reason =
            item.player?.reason || 'Not specified';

        lines.push(
            `🤕 ${player}`,
            `🏟️ ${team}`,
            `⚠️ ${type}`,
            `🩹 ${reason}`,
            ''
        );
    }

    return box('🤕 EPL INJURIES', lines);
}


// ─────────────────────────────────────────────
// TEAM SEARCH
// ─────────────────────────────────────────────

async function cmdTeam(args) {

    // args:
    // [".football", "team", "Arsenal"]

    const name =
        args.slice(2).join(' ').trim();

    if (!name) {

        return box('👥 TEAM SEARCH', [
            '',
            'Please enter a team name.',
            '',
            'Example:',
            '.football team Arsenal'
        ]);
    }

    const data = await fetchFootball('/teams', {
        search: name
    });

    const results =
        data?.response || [];

    if (!results.length) {

        return box('👥 TEAM SEARCH', [
            '',
            `No team found for "${name}".`
        ]);
    }

    const result = results[0];

    const team =
        result.team || {};

    const venue =
        result.venue || {};

    const teamId =
        team.id;

    const lines = [
        `🏟️ *${team.name || 'Unknown'}*`,
        `🌍 ${team.country || 'Unknown'}`,
        `🏟️ Stadium: ${venue.name || 'Unknown'}`,
        `👥 Capacity: ${venue.capacity || 'N/A'}`
    ];

    // Find active competitions
    try {

        const leagueData =
            await fetchFootball('/leagues', {
                team: teamId,
                current: true
            });

        const leagues =
            leagueData?.response || [];

        if (leagues.length) {

            lines.push('');

            lines.push('🏆 Active competitions:');

            for (const league of leagues.slice(0, 3)) {

                lines.push(
                    `• ${league.name}`
                );
            }
        }

    } catch (_) {
        // Optional information
    }

    // Upcoming fixtures
    try {

        const from =
            getDateNairobi(0);

        const to =
            getDateNairobi(14);

        const fixtureData =
            await fetchFootball('/fixtures', {

                team: teamId,
                from,
                to,
                timezone: TZ

            });

        const fixtures =
            fixtureData?.response || [];

        if (fixtures.length) {

            lines.push('');
            lines.push('📅 Upcoming:');

            for (const fixture of fixtures.slice(0, 3)) {

                const home =
                    fixture.teams?.home?.name || '';

                const away =
                    fixture.teams?.away?.name || '';

                const time =
                    formatTimeNairobi(
                        fixture.fixture?.date
                    );

                lines.push(
                    `• ${home} vs ${away}`,
                    `  ⏰ ${time}`
                );
            }
        }

    } catch (_) {
        // Optional information
    }

    return box(
        '👥 TEAM CENTER',
        lines
    );
}


// ─────────────────────────────────────────────
// PLAYER
// ─────────────────────────────────────────────

async function cmdPlayer(args) {

    // args:
    // [".football", "player", "Messi"]

    const name =
        args.slice(2).join(' ').trim();

    if (!name) {

        return box('👤 PLAYER SEARCH', [
            '',
            'Please enter a player name.',
            '',
            'Example:',
            '.football player Messi'
        ]);
    }

    const season =
        await getCurrentSeason(EPL_ID);

    const data = await fetchFootball('/players', {

        search: name,
        season

    });

    const results =
        data?.response || [];

    if (!results.length) {

        return box('👤 PLAYER SEARCH', [
            '',
            `No player found for "${name}".`
        ]);
    }

    const result =
        results[0];

    const player =
        result.player || {};

    const stats =
        result.statistics || [];

    const firstStats =
        stats[0] || {};

    const games =
        firstStats.games || {};

    const goals =
        firstStats.goals || {};

    const assists =
        firstStats.assists || {};

    const cards =
        firstStats.cards || {};

    const lines = [

        `👤 *${player.name || 'Unknown'}*`,

        `🌍 ${player.nationality || 'Unknown'}`,

        `🎂 Age: ${player.age || 'N/A'}`,

        `⚽ Position: ${
            player.position || 'N/A'
        }`,

        `🏟️ Team: ${
            firstStats.team?.name || 'N/A'
        }`,

        '',

        `📊 Season: ${season}`,

        `🏟️ Appearances: ${
            games.appearances ??
            games.total ??
            0
        }`,

        `⚽ Goals: ${
            goals.total ?? 0
        }`,

        `🅰️ Assists: ${
            assists.total ?? 0
        }`,

        `🟨 Yellow: ${
            cards.yellow ?? 0
        }`,

        `🟥 Red: ${
            cards.red ?? 0
        }`

    ];

    return box(
        '👤 PLAYER CENTER',
        lines
    );
}


// ─────────────────────────────────────────────
// TOP SCORERS
// ─────────────────────────────────────────────

async function cmdTop() {

    const season =
        await getCurrentSeason(EPL_ID);

    const data =
        await fetchFootball(
            '/players/topscorers',
            {
                league: EPL_ID,
                season
            }
        );

    const players =
        data?.response || [];

    if (!players.length) {

        return box('🎯 EPL TOP SCORERS', [
            '',
            'Top scorers are currently unavailable.'
        ]);
    }

    const lines = [
        `📅 Season: ${season}`,
        ''
    ];

    for (let i = 0; i < Math.min(players.length, 10); i++) {

        const item =
            players[i];

        const player =
            item.player?.name || 'Unknown';

        const team =
            item.statistics?.[0]
                ?.team?.name || 'Unknown';

        const goals =
            item.statistics?.[0]
                ?.goals?.total ?? 0;

        const assists =
            item.statistics?.[0]
                ?.goals?.assists ?? 0;

        lines.push(
            `${i + 1}. ⚽ ${player}`,
            `   🏟️ ${team}`,
            `   ⚽ ${goals} goals | 🅰️ ${assists}`,
            ''
        );
    }

    return box(
        '🎯 EPL TOP SCORERS',
        lines
    );
}


// ─────────────────────────────────────────────
// NEWS
// ─────────────────────────────────────────────

async function cmdNews() {

    if (!newsApi) {

        return box('📰 FOOTBALL NEWS', [
            '',
            '⚠️ News service is not configured.',
            '',
            'Set:',
            'FOOTBALL_NEWS_API_KEY',
            '',
            'to enable football news.'
        ]);
    }

    try {

        const response =
            await newsApi.get('/everything', {

                params: {
                    q: '"football" OR "soccer"',
                    language: 'en',
                    sortBy: 'publishedAt',
                    pageSize: 5
                }

            });

        const articles =
            response.data?.articles || [];

        if (!articles.length) {

            return box('📰 FOOTBALL NEWS', [
                '',
                'No recent football news found.'
            ]);
        }

        const lines = [];

        for (const article of articles) {

            const title =
                article.title || 'Untitled';

            const source =
                article.source?.name ||
                'Unknown source';

            const url =
                article.url || '';

            lines.push(
                `📰 *${title}*`,
                `🏷️ ${source}`,
                url ? `🔗 ${url}` : '',
                ''
            );
        }

        return box(
            '📰 FOOTBALL NEWS',
            lines
        );

    } catch (error) {

        return box('📰 FOOTBALL NEWS', [
            '',
            '⚠️ News service error.',
            '',
            'Please try again later.'
        ]);
    }
}


// ─────────────────────────────────────────────
// MAIN PLUGIN
// ─────────────────────────────────────────────

module.exports = {

    name: 'football',

    category: 'Sports',

    aliases: [
        'foot',
        'soccer',
        'scores'
    ],

    description:
        'Football live scores, fixtures, standings, injuries, players and news',

    tags: [
        'sports',
        'football',
        'live',
        'scores'
    ],

    async execute(sock, m) {

        const prefix =
            global.BOT_PREFIX || '.';

        const text =
            m.text ||
            m.body ||
            '';

        const args =
            text.trim()
                .split(/\s+/)
                .filter(Boolean);

        const sub =
            args[1]
                ? args[1].toLowerCase()
                : '';

        let reply;

        try {

            switch (sub) {

                case '':
                case 'help':
                    reply =
                        await cmdHelp(prefix);
                    break;

                case 'live':
                    reply =
                        await cmdLive();
                    break;

                case 'today':
                    reply =
                        await cmdDate(0);
                    break;

                case 'tomorrow':
                    reply =
                        await cmdDate(1);
                    break;

                case 'fixtures':
                    reply =
                        await cmdFixtures();
                    break;

                case 'standings':
                case 'table':
                    reply =
                        await cmdStandings();
                    break;

                case 'injuries':
                case 'injury':
                    reply =
                        await cmdInjuries();
                    break;

                case 'team':
                    reply =
                        await cmdTeam(args);
                    break;

                case 'player':
                    reply =
                        await cmdPlayer(args);
                    break;

                case 'top':
                case 'topscorers':
                    reply =
                        await cmdTop();
                    break;

                case 'news':
                    reply =
                        await cmdNews();
                    break;

                default:

                    reply = box(
                        '⚽ FREEZER FOOTBALL',
                        [
                            '',
                            `❌ Unknown option: ${sub}`,
                            '',
                            `Use ${prefix}football help`
                        ]
                    );
            }

        } catch (error) {

            console.error(
                '❌ FREEZER Football:',
                error.message
            );

            reply = box(
                '⚠️ FOOTBALL ERROR',
                [
                    '',
                    error.message ||
                        'Unable to fetch football data.',
                    '',
                    'Please try again shortly.'
                ]
            );
        }

        try {

            if (typeof m.reply === 'function') {

                await m.reply(
                    truncate(reply)
                );

            } else if (
                typeof m.send === 'function'
            ) {

                await m.send(
                    truncate(reply)
                );

            } else {

                await sock.sendMessage(
                    m.from,
                    {
                        text: truncate(reply)
                    }
                );
            }

        } catch (sendError) {

            console.error(
                '❌ Football send error:',
                sendError.message
            );
        }
    }
};
