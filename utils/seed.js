const mongoose = require("mongoose");
const config = require("config");
const User = require("../models/user");
const Product = require("../models/product");

const users = [
  {
    firstName: "User",
    lastName: "User",
    email: "user@example.com",
    username: "user",
    password: "user",
  },
  {
    firstName: "Admin",
    lastName: "Admin",
    email: "admin@example.com",
    admin: true,
    username: "admin",
    password: "admin",
  },
];

const products = [
  {
    name: "Margherita",
    description: "sos pomidorowy, mozzarella",
    type: "pizza",
    price: 24.0,
  },
  {
    name: "Neapolitana",
    description: "sos pomidorowy, mozzarella, pieczarki",
    type: "pizza",
    price: 25.0,
  },
  {
    name: "Prosciutto",
    description: "sos pomidorowy, mozzarella, szynka",
    type: "pizza",
    price: 27.0,
  },
  {
    name: "Capricciosa",
    description: "sos pomidorowy, mozzarella, szynka, pieczarki",
    type: "pizza",
    price: 30.0,
  },
  {
    name: "Vegetariana",
    description:
      "sos pomidorowy, mozzarella, kukurydza, pomidorki koktajlowe, papryka, cebula",
    type: "pizza",
    price: 32.0,
  },
];

const seed = async () => {
  await User.deleteMany({});
  await Promise.all(
    users.map(({ password, ...user }) => User.register(user, password))
  );

  await Product.deleteMany({});
  await Promise.all(products.map((product) => Product.create(product)));
};

mongoose
  .connect(config.MONGO_HOST)
  .then(() => {
    seed().then(() => {
      mongoose.connection.close();
    });
  })
  .catch((err) => console.error("Error on MongoDB connection\n", err));
