"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
let client = new __1.EasyClient({
    token: process.env.BotToken,
    prefixes: ["!"],
    intents: ["Guilds", "GuildMessages", "MessageContent"],
});
client.login();
console.log(client.managers);
//# sourceMappingURL=index.js.map