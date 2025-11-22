// order.model.js
const mongoose = require("mongoose");

const whatsappSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      require: true,
    },
    quantity: Number,
    note: String,
    finalPrice: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("whatsapp", whatsappSchema);
