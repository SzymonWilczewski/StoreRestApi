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
const user2 = {
  firstName: "Anna",
  lastName: "Nowak",
  email: "annanowak@example.com",
  username: "anna_nowak",
  password: "321drowssap",
};

describe("Users:", () => {
  const agent = chai.request.agent(app);

  before(() => {
    mongo.connect();
  });

  beforeEach(() => {
    agent.post("/auth/register").send(user1);
    agent
      .post("/auth/login")
      .send({ login: user1.login, password: user1.password });
  });

  after(() => {
    agent.close();
  });

  describe("GET /users", () => {
    it("should get an empty list of users", () => {
      chai
        .request(app)
        .get("/users")
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("users");
          res.body.users.should.be.an("array");
          res.body.users.length.should.be.eql(0);
        });
    });

    it("should get a list with one user", () => {
      agent.get("/users").then((res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("users");
        res.body.users.should.be.an("array");
        res.body.users.length.should.be.eql(1);
      });
    });

    it("should get a list with three users", () => {
      agent
        .post("/auth/register")
        .send(user2)
        .then(() => {
          agent.get("/users").then((res) => {
            res.should.have.status(200);
            res.body.should.be.an("object");
            res.body.should.have.property("users");
            res.body.users.should.be.an("array");
            res.body.users.length.should.be.eql(2);
          });
        });
    });
  });

  describe("GET /users/:id", () => {
    it("should get a specific user by id", () => {
      agent
        .post("/auth/register")
        .send(user2)
        .then(({ id }) =>
          agent
            .login("/auth/login")
            .send({ username: user2.username, password: user2.password })
            .then(() => {
              agent.get(`/users/${id}`).then((res) => {
                res.should.have.status(200);
                res.body.should.be.an("object");
                res.body.should.have.property("user");
                res.body.user.should.be.an("object");
              });
            })
        );
    });

    it("should return 404 when trying to get a non-existent user by id", () => {
      const nonExistentUserId = "5f7c503c40f259001c2d6f51";

      agent.get(`/users/${nonExistentUserId}`).then((res) => {
        res.should.have.status(404);
        res.body.should.be.an("object");
        res.body.should.have.property("message").eql("The user does not exist");
      });
    });

    it("should return 401 when unauthorized user tries to get a specific user by id", () => {
      agent
        .post("/auth/register")
        .send(user2)
        .then(({ id }) => {
          agent.post("/auth/logout").then(() => {
            agent.get(`/users/${id}`).then((res) => {
              res.should.have.status(401);
              res.body.should.be.an("object");
              res.body.should.have.property("message").eql("Unauthorized");
            });
          });
        });
    });
  });

  describe("PATCH /users/:id", () => {
    it("should update a specific user by id", () => {
      const updatedUserData = {
        lastName: "Nowacka",
      };

      agent
        .post("/auth/register")
        .send(user2)
        .then(({ id }) => {
          agent
            .patch(`/users/${id}`)
            .send(updatedUserData)
            .then((res) => {
              res.should.have.status(200);
              res.body.should.be.an("object");
              res.body.should.have.property("user");
              res.body.user.should.be.an("object");
              res.body.user.should.have
                .property("lastName")
                .eql(updatedUserData.lastName);
            });
        });
    });

    it("should return 404 when trying to update a non-existent user by id", () => {
      const nonExistentUserId = "5f7c503c40f259001c2d6f51";

      const updatedUserData = {
        lastName: "Nowacka",
      };

      agent
        .patch(`/users/${nonExistentUserId}`)
        .send(updatedUserData)
        .then((res) => {
          res.should.have.status(404);
          res.body.should.be.an("object");
          res.body.should.have
            .property("message")
            .eql("The user does not exist");
        });
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete a specific user by id", () => {
      agent
        .post("/auth/register")
        .send(user2)
        .then(({ id }) => {
          agent.delete(`/users/${id}`).then((res) => {
            res.should.have.status(200);
            res.body.should.be.an("object");
            res.body.should.have.property("user");
            res.body.user.should.be.an("object");
          });
        });
    });

    it("should return 404 when trying to delete a non-existent user by id", () => {
      const nonExistentUserId = "5f7c503c40f259001c2d6f51";

      agent.delete(`/users/${nonExistentUserId}`).then((res) => {
        res.should.have.status(404);
        res.body.should.be.an("object");
        res.body.should.have.property("message").eql("The user does not exist");
      });
    });
  });
});
