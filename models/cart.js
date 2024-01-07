const { Schema, model } = require("mongoose");

const Cart = new Schema(
  {
    products: [
      {
        id: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: [0, "The price cannot be negative"],
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "The quantity cannot be less than 1"],
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: [0, "The total cannot be negative"],
    },
  },
  { _id: false }
);

module.exports = model("Cart", Cart);
