const { PermissionsBitField } = require("discord.js");
const {
  joinToCreateChannelId,
  activeCategoryId,
  archivedCategoryId,
} = require("../config/config");
const { createdChannels } = require("../utils/channelManager");

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState, client) {
    const guild = newState.guild;
    const user = newState.member?.user;

    if (newState.channelId === joinToCreateChannelId) {
      try {
        if (createdChannels.has(user.username)) {
          const existingChannel = guild.channels.cache.get(
            createdChannels.get(user.username)
          );

          if (existingChannel) {
            await existingChannel.setParent(activeCategoryId, {
              lockPermissions: false,
            });
            await existingChannel.permissionOverwrites.edit(
              guild.roles.everyone,
              {
                [PermissionsBitField.Flags.ViewChannel]: true,
              }
            );

            return await newState.member.voice.setChannel(existingChannel);
          }
        }

        const newChannel = await guild.channels.create({
          name: `${user.username}'s channel`,
          type: 2,
          parent: activeCategoryId,
          permissionOverwrites: [
            {
              id: client.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.Connect,
                PermissionsBitField.Flags.MoveMembers,
              ],
            },
            {
              id: guild.roles.everyone,
              allow: [PermissionsBitField.Flags.ViewChannel],
              deny: [PermissionsBitField.Flags.Connect],
            },
          ],
        });

        createdChannels.set(user.username, newChannel.id);

        await newState.member.voice.setChannel(newChannel);
      } catch (error) {
        console.error("Error creating voice channel: ", error);
      }
    }

    if (
      oldState.channelId &&
      Array.from(createdChannels.values()).includes(oldState.channelId)
    ) {
      const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);

      if (oldChannel && oldChannel.members.size === 0) {
        try {
          await oldChannel.setParent(archivedCategoryId, {
            lockPermissions: false,
          });

          await oldChannel.permissionOverwrites.edit(guild.roles.everyone, {
            [PermissionsBitField.Flags.ViewChannel]: false,
          });
        } catch (error) {
          console.error("Error archiving channel: ", error);
        }
      }
    }
  },
};
