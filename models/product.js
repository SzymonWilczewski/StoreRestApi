const { Schema, model } = require("mongoose");

const Product = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
    default: "",
  },
  price: {
    type: Number,
    required: true,
    min: [0, "The price cannot be negative"],
  },
});

module.exports = model("Product", Product);
