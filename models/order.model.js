const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true, // Allow guest orders
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "store",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        qty: Number,
        price: Number,
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "searching",
        "placed",
        "accepted",
        "confirmed",
        "preparing",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "placed",
    },
    paymentMethod: {
      type: String,
      enum: ["whatsapp", "cash", "card", "wallet"],
      default: "whatsapp",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    customerInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: String,
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    address: {
      type: String,
    },
    note: {
      type: String,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    deliveryProofUrl: {
      type: String,
    },
    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("order", orderSchema);
