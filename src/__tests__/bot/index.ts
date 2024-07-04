import { EasyClient } from "../..";

let client = new EasyClient({
  token: process.env.BotToken,
  prefixes: ["!"],
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});

client.login();
