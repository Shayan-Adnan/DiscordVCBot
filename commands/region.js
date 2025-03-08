const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("region")
    .setDescription("Changes the region of the VC.")
    .addStringOption((option) =>
      option
        .setName("region")
        .setDescription("The region the VC will be changed to.")
        .setRequired(true)
        .addChoices(
          { name: "US West", value: "us-west" },
          { name: "Brazil", value: "brazil" },
          { name: "Hong Kong", value: "hongkong" },
          { name: "India", value: "india" },
          { name: "Japan", value: "japan" },
          { name: "Rotterdam", value: "rotterdam" },
          { name: "Russia", value: "russia" },
          { name: "Singapore", value: "singapore" },
          { name: "South Korea", value: "south-korea" },
          { name: "South Africa", value: "southafrica" },
          { name: "Sydney", value: "sydney" },
          { name: "US Central", value: "us-central" },
          { name: "US East", value: "us-east" },
          { name: "US South", value: "us-south" },
          { name: "Automatic", value: "automatic" }
        )
    ),

  async execute(interaction) {
    const region = interaction.options.get("region").value;
    const userVC = interaction.member.voice.channel;

    try {
      await userVC.setRTCRegion(region);
      interaction.reply({
        content: `Set VC region to ${region}`,
      });
    } catch (error) {
      console.error("Error changing VC region: ", error);
      interaction.reply({
        content: "Failed to change VC region.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
