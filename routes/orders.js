const router = require("express").Router();
const { isAuth, isAdmin } = require("../utils/auth");
const User = require("../models/user");
const Order = require("../models/order");
const Cart = require("../models/cart");

// Get an order by id
router.get("/:id", isAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const order = await Order.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "The user does not exist",
      });
    } else if (!order) {
      return res.status(404).json({
        message: "The order does not exist",
      });
    } else if (!order.user.equals(user._id)) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    return res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
});

// Create an order
router.post("/", isAuth, async (req, res, next) => {
  try {
    const { phone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "The user does not exist",
      });
    } else if (user.cart.products.length === 0) {
      return res.status(422).json({
        message: "The cart cannot be empty",
      });
    }

    const order = new Order({
      user: user._id,
      cart: user.cart,
      phone,
      address,
      status: "CREATED",
    });
    user.cart = new Cart({
      products: [],
      total: 0,
    });

    const newOrder = await order.save();
    await user.save();

    return res.status(201).json({ order: newOrder });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Update an order
router.put("/:id", isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user, cart, phone, address, status } = req.body;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "The order does not exist",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { user, cart, phone, address, status },
      { new: true }
    );

    return res.status(200).json({ order: updatedOrder });
  } catch (err) {
    next(err);
  }
});

// Modify an order
router.patch("/:id", isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "The order does not exist",
      });
    }

    const {
      user = order.user,
      cart = order.cart,
      phone = order.phone,
      address = order.address,
      status = order.status,
    } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { user, cart, phone, address, status },
      { new: true }
    );

    return res.status(200).json({ order: updatedOrder });
  } catch (err) {
    next(err);
  }
});

// Delete an order
router.delete("/:id", isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        message: "The order does not exist",
      });
    }

    return res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
