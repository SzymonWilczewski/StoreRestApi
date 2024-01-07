const router = require("express").Router();
const auth = require("./auth");
const cart = require("./cart");
const orders = require("./orders");
const products = require("./products");
const users = require("./users");

router.use("/auth", auth);
router.use("/cart", cart);
router.use("/orders", orders);
router.use("/products", products);
router.use("/users", users);

module.exports = router;
