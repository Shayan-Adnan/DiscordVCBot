const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Locks the VC."),

  async execute(interaction) {
    const userVC = interaction.member.voice.channel;

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
