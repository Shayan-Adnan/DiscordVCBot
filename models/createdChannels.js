const mongoose = require("mongoose");

const CreatedChannelSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("CreatedChannels", CreatedChannelSchema);
