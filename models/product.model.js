const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "store",
      default: null,
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
      type: [String], // array of image URLs
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    sale: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    Isadvertising: {
      type: Boolean,
      default: false,
    },

    stock: {
      type: Number,
      default: 0,
    },

    Isdeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.virtual("finalPrice").get(function () {
  if (!this.sale || this.sale === 0) return this.price;
  return this.price - (this.price * this.sale) / 100;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("product", productSchema);
