db = db.getSiblingDB("prod");
db.createUser({
  user: "prod",
  pwd: "prod",
  roles: [
    {
      role: "readWrite",
      db: "prod",
    },
  ],
});
db.createCollection("sessions");
