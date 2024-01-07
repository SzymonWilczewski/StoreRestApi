const router = require("express").Router();
const { isAuth } = require("../utils/auth");
const User = require("../models/user");
const Product = require("../models/product");

// Get a cart
router.get("/", isAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "The user does not exist",
      });
    }

    res.status(200).json({
      cart: user.cart,
    });
  } catch (err) {
    next(err);
  }
});

// Add the product to cart
router.post("/product/:id", isAuth, async (req, res, next) => {
  try {
    const { quantity = 1 } = req.body;
    const user = await User.findById(req.user._id);
    const product = await Product.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "The user does not exist",
      });
    } else if (!product) {
      return res.status(404).json({
        message: "The product does not exist",
      });
    } else if (quantity < 1) {
      return res.status(422).json({
        message: "The quantity cannot be less than 1",
      });
    }

    if (user.cart.products.some((p) => p.id.equals(product._id))) {
      user.cart.products = user.cart.products.map((p) =>
        p.id.equals(product._id) ? { ...p, quantity: p.quantity + quantity } : p
      );
    } else {
      user.cart.products.push({
        id: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    user.cart.total = user.cart.products.reduce(
      (sum, { price, quantity }) => sum + price * quantity,
      0
    );

    user
      .save()
      .then((user) =>
        res.status(200).json({
          cart: user.cart,
        })
      )
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
});

// Delete the product from cart
router.delete("/product/:id", isAuth, async (req, res, next) => {
  try {
    const { quantity = 1 } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "The user does not exist",
      });
    } else if (quantity < 1) {
      return res.status(422).json({
        message: "The quantity cannot be less than 1",
      });
    }

    const product = user.cart.products.find((p) => p.id.equals(req.params.id));

    if (!product) {
      return res.status(404).json({
        message: "The product is not in the cart",
      });
    } else if (product.quantity < quantity) {
      return res.status(400).json({
        message: `The quantity cannot be larger than ${product.quantity}`,
      });
    }

    if (product.quantity === quantity) {
      user.cart.products = user.cart.products.filter(
        (p) => !p.id.equals(req.params.id)
      );
    } else {
      user.cart.products = user.cart.products.map((p) =>
        p.id.equals(req.params.id)
          ? { ...p, quantity: p.quantity - quantity }
          : p
      );
    }

    user.cart.total = user.cart.products.reduce(
      (sum, { price, quantity }) => sum + price * quantity,
      0
    );

    user
      .save()
      .then((user) =>
        res.status(200).json({
          cart: user.cart,
        })
      )
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
