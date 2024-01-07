const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);

const mongo = require("../utils/mongo");
const app = require("../index");
const Order = require("../models/order");

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
const order1 = {
  phone: "123456789",
  address: {
    street: "Marszałkowska",
    number: "111A/222",
    city: "Warszawa",
    zip: "00-110",
    country: "Polska",
  },
};

describe("Orders:", () => {
  const agent = chai.request.agent(app);

  before(() => {
    mongo.connect();
  });

  beforeEach(() => {
    agent.post("/auth/register").send(user1);
    agent
      .post("/auth/login")
      .send({ login: user1.login, password: user1.password });
    Order.deleteMany({});
  });

  after(() => {
    agent.close();
  });

  describe("GET /orders/:id", () => {
    it("should get an order by id", () => {
      agent
        .post("/orders")
        .send(order1)
        .then((order) => {
          agent.get(`/orders/${order._id}`).then((res) => {
            res.should.have.status(200);
            res.body.should.be.an("object");
            res.body.should.have.property("cart");
            res.body.cart.should.have.property("products");
            res.body.cart.products.should.be.an("array");
            res.body.cart.products.length.should.be.eql(0);
            res.body.cart.should.have.property("total");
            res.body.cart.total.should.be.eql(0);
            res.body.should.have.property("phone");
            res.body.phone.should.be.a("string");
            res.body.should.have.property("address");
            res.body.address.should.have.property("street");
            res.body.address.should.have.property("number");
            res.body.address.should.have.property("city");
            res.body.address.should.have.property("zip");
            res.body.address.should.have.property("country");
            res.body.should.have.property("status");
            res.body.status.should.be.a("string");
            res.body.status.should.be.eql("CREATED");
          });
        });
    });

    it("should return an error if the order does not exist", () => {
      const nonExistentOrderId = "5f7c503c40f259001c2d6f51";

      agent.get(`/orders/${nonExistentOrderId}`).then((res) => {
        res.should.have.status(404);
        res.body.should.be.an("object");
        res.body.should.have
          .property("message")
          .eql("The order does not exist");
      });
    });

    it("should return an error if not authorized", () => {
      agent
        .post("/orders")
        .send(order1)
        .then((createdOrder) => {
          agent.get("/auth/logout").then(() => {
            agent.get(`/orders/${createdOrder.body.order._id}`).then((res) => {
              res.should.have.status(401);
              res.body.should.be.an("object");
              res.body.should.have.property("message").eql("Unauthorized");
            });
          });
        });
    });
  });

  describe("POST /orders", () => {
    it("should create a new order", () => {
      agent
        .post("/orders")
        .send(order1)
        .then((res) => {
          res.should.have.status(201);
          res.body.should.be.an("object");
          res.body.should.have.property("order");
          res.body.order.should.have.property("user");
          res.body.order.should.have.property("cart");
          res.body.order.should.have.property("phone");
          res.body.order.should.have.property("address");
          res.body.order.should.have.property("status");
          res.body.order.status.should.be.eql("CREATED");
        });
    });

    it("should return an error if the cart is empty", () => {
      agent
        .post("/orders")
        .send(order1)
        .then((res) => {
          res.should.have.status(422);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The cart cannot be empty");
        });
    });
  });

  describe("PUT /orders/:id", () => {
    it("should update an existing order", () => {
      agent
        .post("/orders")
        .send(order1)
        .then((createdOrder) => {
          const updatedOrderData = {
            ...order1,
            phone: "987654321",
          };
          agent
            .put(`/orders/${createdOrder.body.order._id}`)
            .send(updatedOrderData)
            .then((res) => {
              res.should.have.status(200);
              res.body.should.be.an("object");
              res.body.should.have.property("order");
              res.body.order.should.have.property("user");
              res.body.order.should.have.property("cart");
              res.body.order.should.have.property("phone");
              res.body.order.phone.should.eql("987654321");
              res.body.order.should.have.property("address");
              res.body.order.should.have.property("status");
            });
        });
    });

    it("should return an error if the order does not exist", () => {
      const nonExistentOrderId = "5f7c503c40f259001c2d6f51";

      agent
        .put(`/orders/${nonExistentOrderId}`)
        .send({
          ...order1,
          phone: "987654321",
        })
        .then((res) => {
          res.should.have.status(404);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The order does not exist");
        });
    });
  });

  describe("PATCH /orders/:id", () => {
    it("should modify an existing order", () => {
      agent
        .post("/orders")
        .send(order1)
        .then((createdOrder) => {
          const modifiedOrderData = {
            ...order1,
            phone: "987654321",
          };
          agent
            .patch(`/orders/${createdOrder.body.order._id}`)
            .send(modifiedOrderData)
            .then((res) => {
              res.should.have.status(200);
              res.body.should.be.an("object");
              res.body.should.have.property("order");
              res.body.order.should.have.property("user");
              res.body.order.should.have.property("cart");
              res.body.order.should.have.property("phone");
              res.body.order.phone.should.eql("987654321");
              res.body.order.should.have.property("address");
              res.body.order.should.have.property("status");
            });
        });
    });

    it("should return an error if the order does not exist", () => {
      const nonExistentOrderId = "5f7c503c40f259001c2d6f51";

      agent
        .patch(`/orders/${nonExistentOrderId}`)
        .send({
          ...order1,
          phone: "987654321",
        })
        .then((res) => {
          res.should.have.status(404);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The order does not exist");
        });
    });
  });

  describe("DELETE /orders/:id", () => {
    it("should delete an existing order", () => {
      agent
        .post("/orders")
        .send(order1)
        .then((createdOrder) => {
          agent.delete(`/orders/${createdOrder.body.order._id}`).then((res) => {
            res.should.have.status(200);
            res.body.should.be.an("object");
            res.body.should.have.property("cart");
            res.body.cart.should.have.property("products");
            res.body.cart.products.should.be.an("array");
            res.body.cart.products.length.should.be.eql(0);
            res.body.cart.should.have.property("total");
            res.body.cart.total.should.be.eql(0);
            res.body.should.have.property("phone");
            res.body.phone.should.be.a("string");
            res.body.should.have.property("address");
            res.body.address.should.have.property("street");
            res.body.address.should.have.property("number");
            res.body.address.should.have.property("city");
            res.body.address.should.have.property("zip");
            res.body.address.should.have.property("country");
            res.body.should.have.property("status");
            res.body.status.should.be.a("string");
            res.body.status.should.be.eql("CREATED");
          });
        });
    });

    it("should return an error if the order does not exist", () => {
      const nonExistentOrderId = "5f7c503c40f259001c2d6f51";

      agent.delete(`/orders/${nonExistentOrderId}`).then((res) => {
        res.should.have.status(404);
        res.body.should.be.an("object");
        res.body.should.have
          .property("message")
          .eql("The order does not exist");
      });
    });
  });
});
