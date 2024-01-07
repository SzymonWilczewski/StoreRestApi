const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);

const mongo = require("../utils/mongo");
const app = require("../index");
const User = require("../models/user");

const user1 = {
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jankowalski@example.com",
  username: "jan_kowalski",
  password: "password123",
};

describe("Auth:", () => {
  before(() => {
    mongo.connect();
  });

  beforeEach(() => {
    User.deleteMany({});
  });

  describe("POST /auth/register", () => {
    it("should register a new user", () => {
      chai
        .request(app)
        .post("/auth/register")
        .send(user1)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("Registration successful");
          res.body.should.have.property("user");
          res.body.user.should.have.property("_id");
          res.body.user.should.have.property("firstName").eql(user1.firstName);
          res.body.user.should.have.property("lastName").eql(user1.lastName);
          res.body.user.should.have.property("email").eql(user1.email);
          res.body.user.should.have.property("username").eql(user1.username);
          res.body.user.should.have.property("cart");
        });
    });

    it("should not register a user without required fields", () => {
      chai
        .request(app)
        .post("/auth/register")
        .send({})
        .then((res) => {
          res.should.have.status(400);
          res.body.should.be.an("object");
          res.body.should.have.property("message").eql("Validation failed");
        });
    });
  });

  describe("POST /auth/login", () => {
    it("should log in an existing user", () => {
      User.register(user1);

      chai
        .request(app)
        .post("/auth/login")
        .send({ username: user1.username, password: user1.password })
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("message").eql("Login successful");
          res.body.should.have.property("user");
          res.body.user.should.have.property("_id");
          res.body.user.should.have.property("firstName").eql(user1.firstName);
          res.body.user.should.have.property("lastName").eql(user1.lastName);
          res.body.user.should.have.property("email").eql(user1.email);
          res.body.user.should.have.property("username").eql(user1.username);
          res.body.user.should.have.property("cart");
        });
    });

    it("should not log in with incorrect credentials", () => {
      User.register(user1);

      chai
        .request(app)
        .post("/auth/login")
        .send({ username: user1.username, password: "incorrectPassword" })
        .then((res) => {
          res.should.have.status(400);
          res.body.should.be.an("object");
          res.body.should.have.property("message").eql("Incorrect credentials");
        });
    });

    it("should handle missing username field", () => {
      User.register(user1);

      chai
        .request(app)
        .post("/auth/login")
        .send({ password: user1.password })
        .then((res) => {
          res.should.have.status(400);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The username field is missing");
        });
    });

    it("should handle missing password field", () => {
      User.register(user1);

      chai
        .request(app)
        .post("/auth/login")
        .send({ username: user1.username })
        .then((res) => {
          res.should.have.status(400);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The password field is missing");
        });
    });
  });

  describe("POST /auth/logout", () => {
    it("should log out a logged-in user", () => {
      User.register(user1);

      const agent = chai.request.agent(app);

      agent
        .post("/auth/login")
        .send({ username: user1.username, password: user1.password })
        .then(() => {
          return agent.post("/auth/logout");
        })
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("message").eql("Logout successful");
        });
    });

    it("should not log out an unauthenticated user", () => {
      User.register(user1);

      chai
        .request(app)
        .post("/auth/logout")
        .then((res) => {
          res.should.have.status(401);
          res.body.should.be.an("object");
          res.body.should.have.property("message").eql("Unauthorized");
        });
    });
  });

  describe("PUT /auth/change-password", () => {
    it("should change the password for a logged-in user", () => {
      User.register(user1);

      const agent = chai.request.agent(app);

      agent
        .post("/auth/login")
        .send({ username: user1.username, password: user1.password })
        .then(() => {
          return agent.put("/auth/change-password").send({
            oldPassword: user1.password,
            newPassword: "newPassword123",
          });
        })
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("Password changed successfully");
        });
    });

    it("should not change the password for an unauthenticated user", () => {
      User.register(user1);

      chai
        .request(app)
        .put("/auth/change-password")
        .send({
          oldPassword: user1.password,
          newPassword: "newPassword123",
        })
        .then((res) => {
          res.should.have.status(401);
          res.body.should.be.an("object");
          res.body.should.have.property("message").eql("Unauthorized");
        });
    });

    it("should not change the password with missing oldPassword field", () => {
      User.register(user1);

      const agent = chai.request.agent(app);

      agent
        .post("/auth/login")
        .send({ username: user1.username, password: user1.password })
        .then(() => {
          return agent.put("/auth/change-password").send({
            newPassword: "newPassword123",
          });
        })
        .then((res) => {
          res.should.have.status(400);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The oldPassword field is missing");
        });
    });

    it("should not change the password with missing newPassword field", () => {
      User.register(user1);

      const agent = chai.request.agent(app);

      agent
        .post("/auth/login")
        .send({ username: user1.username, password: user1.password })
        .then(() => {
          return agent.put("/auth/change-password").send({
            oldPassword: user1.password,
          });
        })
        .then((res) => {
          res.should.have.status(400);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The newPassword field is missing");
        });
    });
  });
});
