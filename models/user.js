const { Schema, model } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const CartSchema = require("./cart").schema;

const User = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "The email is already in use"],
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  cart: {
    type: CartSchema,
    default: {
      products: [],
      total: 0,
    },
  },
});

User.plugin(passportLocalMongoose);

module.exports = model("User", User);
