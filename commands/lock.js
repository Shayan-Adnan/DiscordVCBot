const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} = require("discord.js");

const CreatedChannels = require("../models/createdChannels");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Locks the VC."),

  async execute(interaction) {
    // const userVC = interaction.member.voice.channel;

    const userId = interaction.member.user.id;
    const userCustomVC = await CreatedChannels.findOne({ userId });

    const userVC = await interaction.guild.channels.cache.get(
      userCustomVC.channelId
    );

    try {
      await userVC.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        [PermissionsBitField.Flags.Connect]: false,
      });

      interaction.reply({
        content: "Locked the VC.",
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error locking VC: ", error);
      interaction.reply({
        content: "Failed to lock VC.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
