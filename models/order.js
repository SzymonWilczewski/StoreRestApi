const { Schema, model } = require("mongoose");
const CartSchema = require("./cart").schema;
const AddressSchema = require("./address").schema;

const Order = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cart: {
      type: CartSchema,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      match: /^\+?[1-9][0-9]{7,14}$/,
    },
    address: {
      type: AddressSchema,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "CREATED",
        "CANCELLED",
        "ACCEPTED",
        "READY_FOR_PICKUP",
        "OUT_FOR_DELIVERY",
        "PICKED_UP_BY_CUSTOMER",
      ],
    },
  },
  { timestamps: true }
);

module.exports = model("Order", Order);
