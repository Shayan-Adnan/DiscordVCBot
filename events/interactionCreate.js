const { MessageFlags } = require("discord.js");
const CreatedChannels = require("../models/createdChannels");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const userId = interaction.member.user.id;

    const ownsACustomVC = await CreatedChannels.findOne({ userId });

    if (!ownsACustomVC) {
      return interaction.reply({
        content: "You must own a custom voice channel to use this command!",
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

// const userVC = interaction.member.voice.channel;

// if (!userVC) {
//   return interaction.reply({
//     content: "You must be in a voice channel to use this command!",
//     flags: MessageFlags.Ephemeral,
//   });
// }

// const inACustomVC = await CreatedChannels.findOne({ channelId: userVC.id });

// if (!inACustomVC) {
//   return interaction.reply({
//     content: "You must be in a custom voice channel to use this command!",
//     flags: MessageFlags.Ephemeral,
//   });
// }
