const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("database connected");
  } catch (err) {
    console.log(err.message);
  }
};
module.exports = connectDB;
