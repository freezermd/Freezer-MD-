<!--
███████╗██████╗ ███████╗███████╗███████╗███████╗██████╗
██╔════╝██╔══██╗██╔════╝╚══███╔╝██╔════╝██╔════╝██╔══██╗
█████╗  ██████╔╝█████╗    ███╔╝ █████╗  █████╗  ██████╔╝
██╔══╝  ██╔══██╗██╔══╝   ███╔╝  ██╔══╝  ██╔══╝  ██╔══██╗
██║     ██║  ██║███████╗███████╗███████╗███████╗██║  ██║
╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝
-->

<div align="center">

# 🧊 FREEZER-MD

### `The next generation WhatsApp Multi-Device automation framework.`

**Fast • Modular • Extensible • Developer Friendly**

<br>

<img src="https://capsule-render.vercel.app/api?type=waving&color=auto&height=180&section=header&text=FREEZER-MD&fontSize=65&fontAlignY=35&animation=twinkling&fontColor=ffffff" width="100%"/>

<br>

[![GitHub](https://img.shields.io/badge/GitHub-Freezer--MD-181717?style=for-the-badge\&logo=github)](https://github.com/freezermd/Freezer-MD-)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-MD-25D366?style=for-the-badge\&logo=whatsapp\&logoColor=white)](https://www.whatsapp.com/)
[![License](https://img.shields.io/badge/License-Open%20Source-blue?style=for-the-badge)](#-license)

<br>

![Visitors](https://komarev.com/ghpvc/?username=freezermd\&repo=Freezer-MD-\&style=for-the-badge\&color=blueviolet)
![Stars](https://img.shields.io/github/stars/freezermd/Freezer-MD-?style=for-the-badge)
![Forks](https://img.shields.io/github/forks/freezermd/Freezer-MD-?style=for-the-badge)
![Issues](https://img.shields.io/github/issues/freezermd/Freezer-MD-?style=for-the-badge)

<br><br>

> 🧊 **Freeze the limits. Build beyond.**

</div>

---

## 🧊 What is Freezer-MD?

**Freezer-MD** is a modular WhatsApp Multi-Device bot built with **Node.js**, designed for developers who want a clean, extensible and customizable automation platform.

Instead of putting every command inside one massive file, Freezer-MD uses a **plugin-driven architecture** that makes it easier to add, remove, maintain and scale bot functionality.

### Why Freezer-MD?

```text
┌─────────────────────────────────────────────────────────┐
│                    FREEZER-MD CORE                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ⚡ Fast              🧩 Modular                       │
│   🔐 Session          🛠️ Customizable                  │
│   📦 Plugins          📱 Termux Friendly               │
│   🚀 Expandable       👨‍💻 Developer Focused            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# ✨ Core Features

<table>
<tr>
<td width="50%">

### ⚡ Performance

* Lightweight command system
* Modular execution
* Efficient message handling
* Designed for long-running sessions

</td>
<td width="50%">

### 🧩 Plugin Architecture

* Independent command files
* Easy command registration
* Aliases
* Categories
* Permission handling

</td>
</tr>

<tr>
<td>

### 👥 Group Management

* Admin utilities
* Member management
* Group commands
* Moderation tools
* Tagging utilities

</td>
<td>

### 🎨 Media & Utilities

* Sticker tools
* Media utilities
* Message utilities
* Information commands
* Custom tools

</td>
</tr>

<tr>
<td>

### 🔐 Session System

* WhatsApp MD authentication
* Persistent sessions
* Reconnection support
* Session-based startup

</td>
<td>

### 📱 Mobile Ready

* Termux compatible
* Android deployment
* Git-based installation
* No laptop required for basic deployment

</td>
</tr>
</table>

---

# 🧠 Architecture

Freezer-MD separates the bot engine from its commands.

```text
                         ┌──────────────────┐
                         │    WhatsApp      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     index.js     │
                         │   Bot Startup    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    handler.js    │
                         │ Message Handler  │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
             ┌──────────────┐           ┌──────────────┐
             │   Plugins    │           │     Lib      │
             │   Commands   │           │    Core      │
             └──────┬───────┘           └──────────────┘
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       General    Admin     Media
```

---

# 📁 Project Structure

```text
Freezer-MD/
│
├── 📂 lib/
│   └── Core libraries and bot utilities
│
├── 📂 plugins/
│   └── Modular bot commands
│
├── 📂 session/
│   └── WhatsApp authentication data
│
├── 📄 config.js
│   └── Global bot configuration
│
├── 📄 handler.js
│   └── Message and command processing
│
├── 📄 index.js
│   └── Main application entry point
│
├── 📄 app.json
│   └── Deployment configuration
│
├── 📄 package.json
│   └── Dependencies and scripts
│
└── 📄 README.md
    └── Project documentation
```

---

# 🎮 Command Showcase

Freezer-MD is designed around a simple prefix-based command system.

### 🟢 General

```text
.ping
.menu
.about
.owner
.help
```

### 🛡️ Group Management

```text
.tagall
.hidetag
.kick
.add
.promote
.demote
.mute
.unmute
```

### ⚠️ Moderation

```text
.warn
.warnings
.resetwarn
.antidelete
```

### 🛠️ Media / Tools

```text
.sticker
.toimg
.tomp3
.tovn
.togif
.crop
.resize
```

> **Note:** Available commands depend on the current plugin collection. New commands can be added without rebuilding the core bot architecture.

---

# 🧩 Creating a Plugin

Create a JavaScript file inside:

```text
plugins/
```

Example:

```javascript
module.exports = {
    name: 'ping',
    aliases: ['p'],
    category: 'General',
    description: 'Check bot response time',

    async execute(sock, m) {
        const start = Date.now();

        await sock.sendMessage(
            m.chat,
            {
                text: `🏓 Pong!\n⚡ ${Date.now() - start}ms`
            },
            {
                quoted: m
            }
        );
    }
};
```

Save it as:

```text
plugins/ping.js
```

Restart Freezer-MD and the command becomes part of the bot.

---

# 🚀 Quick Start

## 1️⃣ Clone

```bash
git clone https://github.com/freezermd/Freezer-MD-.git
cd Freezer-MD-
```

## 2️⃣ Install dependencies

```bash
npm install
```

## 3️⃣ Configure

Edit:

```text
config.js
```

## 4️⃣ Start

```bash
node index.js
```

Or, if your `package.json` contains the appropriate start script:

```bash
npm start
```

---

# 📱 Termux Deployment

Freezer-MD is designed to be friendly to Android developers.

### Install requirements

```bash
pkg update -y
pkg upgrade -y
pkg install git nodejs -y
```

### Clone the project

```bash
git clone https://github.com/freezermd/Freezer-MD-.git
cd Freezer-MD-
```

### Install packages

```bash
npm install
```

### Start

```bash
node index.js
```

### 🔄 Update

```bash
git pull
npm install
node index.js
```

---

# ☁️ Deployment

<div align="center">

### 🚀 Deploy Freezer-MD

| Platform           | Status     | Method                 |
| ------------------ | ---------- | ---------------------- |
| 📱 Termux          | 🟢 Ready   | Git + Node.js          |
| 💻 Local PC        | 🟢 Ready   | Node.js                |
| ☁️ VPS             | 🟢 Ready   | Node.js                |
| 🐳 Docker          | 🟡 Planned | Coming                 |
| ☁️ Cloud Platforms | 🟡 Depends | Platform configuration |

</div>

> **Important:** Only add one-click deployment buttons here after configuring a deployment service specifically for Freezer-MD.

---

# 🖼️ Screenshots

<div align="center">

### 🤖 Bot Interface

<!-- Replace these placeholders with actual screenshots -->

<img src="screenshots/menu.jpg" width="45%" alt="Freezer-MD Menu">
<img src="screenshots/ping.jpg" width="45%" alt="Freezer-MD Ping">

### 👥 Group Management

<img src="screenshots/group.jpg" width="45%" alt="Freezer-MD Group Commands">
<img src="screenshots/admin.jpg" width="45%" alt="Freezer-MD Admin Commands">

</div>

> 📌 Create a `screenshots/` directory in the repository and upload your actual bot screenshots using the filenames above.

---

# 🎨 Freezer-MD Showcase

```text
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║                    🧊 FREEZER-MD                         ║
║                                                          ║
║             WhatsApp Multi-Device Bot                   ║
║                                                          ║
║       ⚡ Fast  •  🧩 Modular  •  🔐 Secure              ║
║                                                          ║
║                  > .menu                                ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

# 🔧 Configuration

Freezer-MD centralizes configurable settings inside:

```text
config.js
```

Typical configuration areas include:

```text
BOT PREFIX
BOT NAME
OWNER
MENU SETTINGS
AUTOMATION
STATUS SETTINGS
GROUP SETTINGS
```

Keep private credentials and authentication data outside the public repository.

---

# 🔐 Security

### Never commit sensitive data.

Do **not** publicly upload:

```text
session/
.env
API KEYS
PASSWORDS
TOKENS
PRIVATE CREDENTIALS
```

If authentication credentials are accidentally exposed, invalidate/regenerate them immediately.

---

# 🛣️ Roadmap

## `v1.x`

* [x] Core WhatsApp connection
* [x] Plugin system
* [x] Command handler
* [x] Configuration system
* [x] Session support
* [x] Group utilities
* [x] Utility commands
* [ ] Expanded moderation system
* [ ] More media tools
* [ ] Improved error handling
* [ ] Performance improvements

## `v2.x`

```text
🧠 Advanced automation
🌐 API integrations
📊 Bot analytics
🎨 Advanced UI/menu system
⚡ Performance engine
🔌 External integrations
🛡️ Advanced moderation
🤖 Intelligent features
```

---

# 🤝 Contributing

Freezer-MD is built to grow through the community.

### Contribution workflow

```bash
# Fork the repository

# Clone your fork
git clone YOUR_FORK_URL

# Create a feature branch
git checkout -b feature/my-command

# Make your changes

# Commit
git add .
git commit -m "Add my command"

# Push
git push origin feature/my-command
```

Then open a Pull Request.

### Good contributions include:

* 🐛 Bug fixes
* ⚡ Performance improvements
* 🧩 New plugins
* 🛡️ Security improvements
* 📚 Documentation
* 🎨 UI/menu improvements
* 💡 Feature proposals

---

# 🐛 Bug Reports

Found a problem?

Please include:

```text
Freezer-MD version:
Node.js version:
Operating system:
Command causing the issue:
Expected behavior:
Actual behavior:
Error/log:
```

Do **not** include authentication credentials or private session information.

---

# 📜 License

Freezer-MD is an open-source project.

See the repository license file for the applicable licensing terms.

---

# ⚠️ Disclaimer

Freezer-MD is an independent project and is **not affiliated with, endorsed by, or officially associated with WhatsApp or Meta Platforms, Inc.**

Users are responsible for complying with:

* WhatsApp's applicable terms
* Local laws
* Platform policies
* Responsible automation practices

The developers are not responsible for misuse of the software.

---

# 👨‍💻 Developer

<div align="center">

## 🧊 Freezer-MD

**Built by FreezerMD**

[![GitHub](https://img.shields.io/badge/GitHub-FreezerMD-181717?style=for-the-badge\&logo=github)](https://github.com/freezermd)

</div>

---

# ⭐ Support Freezer-MD

If you like the project:

<div align="center">

### ⭐ Star the repository

### 🍴 Fork it

### 🐛 Report bugs

### 💡 Suggest features

### 🤝 Contribute

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=auto&height=120&section=footer&animation=twinkling"/>

### 🧊 FREEZER-MD

**Freeze the limits. Build beyond.**

`Made with Node.js • Built for WhatsApp • Powered by the community`

</div>
