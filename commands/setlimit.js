const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlimit")
    .setDescription(
      "Allows a user to change the user limit of their private VC"
    )
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setDescription("Number of users to be allowed in the VC.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userVC = interaction.member.voice.channel;
    const limit = interaction.options.getInteger("limit");

    if (limit < 0 || limit > 99) {
      return interaction.reply({
        content: "Please enter a number between 0 and 99",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await userVC.setUserLimit(limit);
      interaction.reply({
        content: `VC limit set to ${limit}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error setting VC limit: ", error);
      interaction.reply({
        content: "Failed to update VC limit",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
