const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);

const mongo = require("../utils/mongo");
const app = require("../index");
const Product = require("../models/product");

const user1 = {
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jankowalski@example.com",
  username: "jan_kowalski",
  password: "password123",
};
const pizza1 = {
  name: "Margherita",
  description: "sos pomidorowy, mozzarella",
  type: "pizza",
  price: 24.0,
};

describe("Cart:", () => {
  const agent = chai.request.agent(app);

  before(() => {
    mongo.connect();
  });

  beforeEach(() => {
    agent.post("/auth/register").send(user1);
    agent
      .post("/auth/login")
      .send({ login: user1.login, password: user1.password });
    Product.deleteMany({});
  });

  after(() => {
    agent.close();
  });

  describe("GET /cart", () => {
    it("should get an empty cart", () => {
      agent.get(`/cart`).then((res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("cart");
        res.body.cart.should.have.property("products");
        res.body.cart.products.should.be.an("array");
        res.body.cart.products.length.should.be.eql(0);
        res.body.cart.should.have.property("total");
        res.body.cart.total.should.be.eql(0);
      });
    });

    it("should get a cart with one product", () => {
      const product1 = Product.create(pizza1);

      agent.post(`/cart/product/${product1._id}`).then(
        agent.get("/cart").then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("cart");
          res.body.cart.should.have.property("products");
          res.body.cart.products.should.be.an("array");
          res.body.cart.products.length.should.be.eql(1);
          res.body.cart.products[0].id.should.be.eql(product1._id);
          res.body.cart.should.have.property("total");
          res.body.cart.total.should.be.eql(product1.price);
        })
      );
    });

    it("should get a cart with two product", () => {
      const product1 = Product.create(pizza1);
      const quantity = 2;

      agent
        .post(`/cart/product/${product1._id}`)
        .send({ quantity })
        .then(
          agent.get("/cart").then((res) => {
            res.should.have.status(200);
            res.body.should.be.an("object");
            res.body.should.have.property("cart");
            res.body.cart.should.have.property("products");
            res.body.cart.products.should.be.an("array");
            res.body.cart.products.length.should.be.eql(1);
            res.body.cart.products[0].id.should.be.eql(product1._id);
            res.body.cart.products[0].quantity.should.be.eql(quantity);
            res.body.cart.should.have.property("total");
            res.body.cart.total.should.be.eql(product1.price * quantity);
          })
        );
    });
  });

  describe("POST /cart/product/:id", () => {
    it("should add a product to the cart", () => {
      const product1 = Product.create(pizza1);
      const quantity = 2;

      agent
        .post(`/cart/product/${product1._id}`)
        .send({ quantity })
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("cart");
          res.body.cart.should.have.property("products");
          res.body.cart.products.should.be.an("array");
          res.body.cart.products.length.should.be.eql(1);
          res.body.cart.products[0].id.should.be.eql(product1._id);
          res.body.cart.products[0].quantity.should.be.eql(quantity);
          res.body.cart.should.have.property("total");
          res.body.cart.total.should.be.eql(product1.price * quantity);
        });
    });

    it("should return 404 when trying to add a non-existent product to the cart", () => {
      const nonExistentProductId = "5f7c503c40f259001c2d6f51";

      agent.post(`/cart/product/${nonExistentProductId}`).then((res) => {
        res.should.have.status(404);
        res.body.should.be.an("object");
        res.body.should.have
          .property("message")
          .eql("The product does not exist");
      });
    });

    it("should return 422 when trying to add a product with quantity less than 1", () => {
      const product1 = Product.create(pizza1);
      const invalidQuantity = -1;

      agent
        .post(`/cart/product/${product1._id}`)
        .send({ quantity: invalidQuantity })
        .then((res) => {
          res.should.have.status(422);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The quantity cannot be less than 1");
        });
    });
  });

  describe("DELETE /cart/product/:id", () => {
    it("should remove a product from the cart", () => {
      const product1 = Product.create(pizza1);
      const quantity = 2;

      agent
        .post(`/cart/product/${product1._id}`)
        .send({ quantity })
        .then(() =>
          agent
            .delete(`/cart/product/${product1._id}`)
            .send({ quantity })
            .then((res) => {
              res.should.have.status(200);
              res.body.should.be.an("object");
              res.body.should.have.property("cart");
              res.body.cart.should.have.property("products");
              res.body.cart.products.should.be.an("array");
              res.body.cart.products.length.should.be.eql(0);
              res.body.cart.should.have.property("total");
              res.body.cart.total.should.be.eql(0);
            })
        );
    });

    it("should return 404 when trying to remove a product that is not in the cart", () => {
      const nonExistentProductId = "5f7c503c40f259001c2d6f51";

      agent.delete(`/cart/product/${nonExistentProductId}`).then((res) => {
        res.should.have.status(404);
        res.body.should.be.an("object");
        res.body.should.have
          .property("message")
          .eql("The product is not in the cart");
      });
    });

    it("should return 400 when trying to remove a product with a quantity larger than in the cart", () => {
      const product1 = Product.create(pizza1);
      const quantity = 2;

      agent
        .post(`/cart/product/${product1._id}`)
        .send({ quantity })
        .then(() =>
          agent
            .delete(`/cart/product/${product1._id}`)
            .send({ quantity: quantity + 2 })
            .then((res) => {
              res.should.have.status(400);
              res.body.should.be.an("object");
              res.body.should.have
                .property("message")
                .eql(`The quantity cannot be larger than ${quantity}`);
            })
        );
    });
  });
});
