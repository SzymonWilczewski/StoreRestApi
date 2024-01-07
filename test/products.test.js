const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);

const mongo = require("../utils/mongo");
const app = require("../index");
const Product = require("../models/product");

const pizza1 = {
  name: "Margherita",
  description: "sos pomidorowy, mozzarella",
  type: "pizza",
  price: 24.0,
};
const pizza2 = {
  name: "Prosciutto",
  description: "sos pomidorowy, mozzarella, szynka",
  type: "pizza",
  price: 27.0,
};
const pizza3 = {
  name: "Vegetariana",
  description:
    "sos pomidorowy, mozzarella, kukurydza, pomidorki koktajlowe, papryka, cebula",
  type: "pizza",
  price: 32.0,
};

describe("Products:", () => {
  before(() => {
    mongo.connect();
  });

  beforeEach(() => {
    Product.deleteMany({});
  });

  describe("GET /products", () => {
    it("should get an empty list of products", () => {
      chai
        .request(app)
        .get("/products")
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("products");
          res.body.products.should.be.an("array");
          res.body.products.length.should.be.eql(0);
        });
    });

    it("should get a list with one product", () => {
      const product1 = Product.create(pizza1);

      chai
        .request(app)
        .get("/products")
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("products");
          res.body.products.should.be.an("array");
          res.body.products.length.should.be.eql(1);
          res.body.products[0]._id.should.be.eql(product1._id);
        });
    });

    it("should get a list with three products", () => {
      const product1 = Product.create(pizza1);
      const product2 = Product.create(pizza2);
      const product3 = Product.create(pizza3);

      chai
        .request(app)
        .get("/products")
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("products");
          res.body.products.should.be.an("array");
          res.body.products.length.should.be.eql(3);
          res.body.products[0]._id.should.be.eql(product1._id);
          res.body.products[1]._id.should.be.eql(product2._id);
          res.body.products[2]._id.should.be.eql(product3._id);
        });
    });
  });

  describe("GET /products/:id", () => {
    it("should get a specific product by id", () => {
      const product = Product.create(pizza1);

      chai
        .request(app)
        .get(`/products/${product._id}`)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("product");
          res.body.product.should.have.property("_id").eql(product._id);
        });
    });

    it("should return 404 for a non-existent product id", () => {
      const nonExistentProductId = "5f7c503c40f259001c2d6f51";

      chai
        .request(app)
        .get(`/products/${nonExistentProductId}`)
        .then((res) => {
          res.should.have.status(404);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The product does not exist");
        });
    });

    it("should handle invalid product id format", () => {
      const invalidProductId = "invalidID";

      chai
        .request(app)
        .get(`/products/${invalidProductId}`)
        .then((res) => {
          res.should.have.status(400);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("Invalid product ID format");
        });
    });
  });

  describe("POST /products", () => {
    it("should create a new product", () => {
      chai
        .request(app)
        .post("/products")
        .send(pizza1)
        .then((res) => {
          res.should.have.status(201);
          res.body.should.be.an("object");
          res.body.should.have.property("product");
          res.body.product.should.have.property("name").eql(pizza1.name);
          res.body.product.should.have
            .property("description")
            .eql(pizza1.description);
          res.body.product.should.have.property("type").eql(pizza1.type);
          res.body.product.should.have.property("price").eql(pizza1.price);
        });
    });

    it("should not create a product without required fields", () => {
      chai
        .request(app)
        .post("/products")
        .send({})
        .then((res) => {
          res.should.have.status(400);
          res.body.should.be.an("object");
          res.body.should.have.property("message").eql("Validation failed");
        });
    });

    it("should not create a product with an invalid price", () => {
      const productWithInvalidPrice = { ...pizza1, price: "invalidPrice" };

      chai
        .request(app)
        .post("/products")
        .send(productWithInvalidPrice)
        .then((res) => {
          res.should.have.status(400);
          res.body.should.be.an("object");
          res.body.should.have.property("message").eql("Validation failed");
        });
    });
  });

  describe("PUT /products/:id", () => {
    it("should update an existing product", () => {
      const product = Product.create(pizza1);
      const updatedPizza1 = { ...pizza1, price: 25.0 };

      chai
        .request(app)
        .put(`/products/${product._id}`)
        .send(updatedPizza1)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("product");
          res.body.product.should.have
            .property("price")
            .eql(updatedPizza1.price);
        });
    });

    it("should return 404 for updating a non-existent product id", () => {
      const nonExistentProductId = "5f7c503c40f259001c2d6f51";

      chai
        .request(app)
        .put(`/products/${nonExistentProductId}`)
        .send(pizza1)
        .then((res) => {
          res.should.have.status(404);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The product does not exist");
        });
    });

    it("should not update a product with an invalid price", () => {
      const product = Product.create(pizza1);
      const updatedPizza1 = { ...pizza1, price: "invalidPrice" };

      chai
        .request(app)
        .put(`/products/${product._id}`)
        .send(updatedPizza1)
        .then((res) => {
          res.should.have.status(400);
          res.body.should.be.an("object");
          res.body.should.have.property("message").eql("Validation failed");
        });
    });
  });

  describe("DELETE /products/:id", () => {
    it("should delete an existing product", () => {
      const product = Product.create(pizza1);

      chai
        .request(app)
        .delete(`/products/${product._id}`)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("product");
          res.body.product.should.have.property("_id").eql(product._id);
        });
    });

    it("should return 404 for deleting a non-existent product id", () => {
      const nonExistentProductId = "5f7c503c40f259001c2d6f51";

      chai
        .request(app)
        .delete(`/products/${nonExistentProductId}`)
        .then((res) => {
          res.should.have.status(404);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The product does not exist");
        });
    });

    it("should handle invalid product id format", () => {
      const invalidProductId = "invalidID";

      chai
        .request(app)
        .delete(`/products/${invalidProductId}`)
        .then((res) => {
          res.should.have.status(400);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("Invalid product ID format");
        });
    });
  });
});
