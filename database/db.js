const mongoose = require("mongoose");
const { dbConnectionString } = require("../config/config");

const connectDatabase = async () => {
  try {
    await mongoose.connect(dbConnectionString);

    console.log("Database connected!");
  } catch (error) {
    console.error("Database connection error: ", error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
