const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "store",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    desc: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    imageURL: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },
    Advertising: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 0,
    },

    inStock: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
