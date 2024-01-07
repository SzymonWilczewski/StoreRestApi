const express = require("express");
const mongo = require("./utils/mongo");
const config = require("config");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const passport = require("passport");
const User = require("./models/user");
const router = require("./routes/router");

const app = express();

mongo.connect();

app.use(
  expressSession({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.MONGO_HOST,
      collectionName: "sessions",
      stringify: false,
    }),
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(router);

app.use("/uploads", express.static("uploads"));

app.use((err, req, res, next) => {
  res.status(500).json(err);
});

const port = config.PORT || 5000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

module.exports = app;
