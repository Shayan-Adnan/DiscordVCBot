const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a user from a private VC and revokes their access.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to kick.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const userVC = interaction.member.voice.channel;

    if (targetUser.id === interaction.member.user.id) {
      return interaction.reply({
        content: "You cannot kick yourself from your own VC!",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      if (userVC.members.has(targetUser.id)) {
        const memberToKick = await interaction.guild.members.fetch(
          targetUser.id
        );
        await memberToKick.voice.disconnect();
      }
      await userVC.permissionOverwrites.edit(targetUser.id, {
        [PermissionsBitField.Flags.Connect]: false,
      });
      interaction.reply({
        content: `${targetUser.username} has been kicked from your VC. They can no longer join.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error kicking user: ", error);
      interaction.reply("Failed to kick user!", MessageFlags.Ephemeral);
    }
  },
};
