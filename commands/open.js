const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("open")
    .setDescription("Opens the VC to the public"),

  async execute(interaction) {
    const userVC = interaction.member.voice.channel;

    try {
      await userVC.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        [PermissionsBitField.Flags.Connect]: true,
      });

      interaction.reply({
        content: "Opened the VC to everyone.",
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error opening VC: ", error);
      interaction.reply({
        content: "Failed to open VC.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
