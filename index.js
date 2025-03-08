require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const { token, clientId, guildId } = require("./config/config");
const registerCommands = require("./handlers/commandHandler");
const registerEvents = require("./handlers/eventHandler");
const connectDatabase = require("./database/db");

connectDatabase();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

registerCommands(client);
registerEvents(client);

client.login(token);

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Refreshing slash commands...");

    const commands = Array.from(client.commands.values()).map((cmd) =>
      cmd.data.toJSON()
    );

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log("Slash commands registered successfully!");
  } catch (error) {
    console.error("Error registering commands: ", error);
  }
})();
