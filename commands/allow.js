const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("allow")
    .setDescription("Allows users to join a private VC.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to allow.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const userVC = interaction.member.voice.channel;

    try {
      await userVC.permissionOverwrites.edit(targetUser.id, {
        [PermissionsBitField.Flags.Connect]: true,
      });

      interaction.reply({
        content: `${targetUser.username} can now join your VC.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error allowing user: ", error);
      interaction.reply("Failed to allow user!", MessageFlags.Ephemeral);
    }
  },
};
