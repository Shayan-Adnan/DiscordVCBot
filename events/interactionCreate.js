const { createdChannels } = require("../utils/channelManager");
const { MessageFlags } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const userVC = interaction.member.voice.channel;

    if (
      !userVC ||
      userVC.id != createdChannels.get(interaction.member.user.username)
    ) {
      return interaction.reply({
        content: "You must be in a custom VC to use this command!",
        flags: MessageFlags.Ephemeral,
      });
    }

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error("Error executing command: ", error);
    }
  },
};
