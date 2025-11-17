const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    userType: {
      type: String,
      enum: ["customer", "admin", "delivery", "storeOwner"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
