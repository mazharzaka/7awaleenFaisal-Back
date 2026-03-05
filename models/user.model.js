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
      required: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    userType: {
      type: String,
      enum: ["customer", "admin", "vendor", "delivery", "storeOwner", "DRIVER"],
      default: "customer",
    },
    role: {
      type: String,
      enum: ["CUSTOMER", "DRIVER", "ADMIN"],
      default: "CUSTOMER",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      required: false,
    },
    otpExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
