const mongoose = require("mongoose");
const config = require("config");

const connect = async () => {
  try {
    await mongoose.connect(config.MONGO_HOST);
  } catch (err) {
    console.error("Error connecting to MongoDB:\n", err);
  }
};

module.exports = { connect };
