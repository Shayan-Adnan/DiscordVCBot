const fs = require("fs");
const path = require("path");

const registerCommands = (client) => {
  client.commands = new Map();

  const commandFiles = fs
    .readdirSync(path.join(__dirname, "../commands"))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    client.commands.set(command.data.name, command);
  }

  console.log(`Loaded ${commandFiles.length} commands.`);
};

module.exports = registerCommands;
