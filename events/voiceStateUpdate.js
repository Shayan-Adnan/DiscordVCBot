const { PermissionsBitField } = require("discord.js");
const {
  joinToCreateChannelId,
  activeCategoryId,
  archivedCategoryId,
} = require("../config/config");
const CreatedChannels = require("../models/createdChannels");

const archiveChannel = async (channel, guild) => {
  await channel.permissionOverwrites.edit(guild.roles.everyone, {
    [PermissionsBitField.Flags.ViewChannel]: false,
  });

  await channel.setParent(archivedCategoryId, {
    lockPermissions: false,
  });
};

const restoreChannel = async (channel, guild) => {
  await channel.setParent(activeCategoryId, {
    lockPermissions: false,
  });

  await channel.permissionOverwrites.edit(guild.roles.everyone, {
    [PermissionsBitField.Flags.ViewChannel]: true,
  });
};

const createChannel = async (user, client, guild) => {
  return await guild.channels.create({
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
        id: user.id,
        allow: [
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
};

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState) {
    const guild = newState.guild;
    const user = newState.member?.user;
    const joinToCreateChannel = guild.channels.cache.get(joinToCreateChannelId);

    if (oldState.channelId) {
      const isACustomVC = await CreatedChannels.findOne({
        channelId: oldState.channelId,
      });
      const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);

      if (isACustomVC && oldChannel?.members.size === 0) {
        try {
          archiveChannel(oldChannel, guild);

          //when user's custom vc in in the archived category, open join-to-create channel for them
          await joinToCreateChannel.permissionOverwrites.edit(user.id, {
            [PermissionsBitField.Flags.Connect]: true,
          });
        } catch (error) {
          console.error("Error archiving channel: ", error);
        }
      }
    }

    if (!newState.channelId || newState.channelId != joinToCreateChannelId)
      return;

    try {
      const existingChannelEntry = await CreatedChannels.findOne({
        userId: user.id,
      });

      if (existingChannelEntry) {
        const existingChannel = guild.channels.cache.get(
          existingChannelEntry.channelId
        );

        if (existingChannel) {
          restoreChannel(existingChannel, guild);

          await newState.member.voice.setChannel(existingChannel);

          //when a user's custom vc in in the active category, lock join-to-create channel for them

          return await joinToCreateChannel.permissionOverwrites.edit(user.id, {
            [PermissionsBitField.Flags.Connect]: false,
          });
        } else {
          await CreatedChannels.deleteOne({ userId: user.id });
          console.log(`Deleted record of ${user.id}`);
        }
      }

      const newChannel = await createChannel(user, newState.client, guild);

      await CreatedChannels.create({
        userId: user.id,
        channelId: newChannel.id,
      });

      console.log(`Added new channel to database (for ${user.username})`);

      await newState.member.voice.setChannel(newChannel);
    } catch (error) {
      console.error("Error creating voice channel: ", error);

      //if someone joins join-to-create channel but leaves too quickly
      if (error.rawError.message === "Target user is not connected to voice.") {
        try {
          const existingChannelEntry = await CreatedChannels.findOne({
            userId: user.id,
          });

          if (existingChannelEntry) {
            const existingChannel = guild.channels.cache.get(
              existingChannelEntry.channelId
            );
            await existingChannel?.setParent(archivedCategoryId, {
              lockPermissions: false,
            });
            await existingChannel?.permissionOverwrites.edit(
              guild.roles.everyone,
              {
                [PermissionsBitField.Flags.ViewChannel]: false,
              }
            );
          }
        } catch (error) {
          console.log("Failed to archive channel.", error);
        }
      }
    }
  },
};
