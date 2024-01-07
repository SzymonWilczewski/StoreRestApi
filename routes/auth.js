const router = require("express").Router();
const User = require("../models/user");
const passport = require("passport");
const { isAuth } = require("../utils/auth");

// Create a new user
router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;

    const user = await User.register(
      { firstName, lastName, email, username },
      password
    );

    return res.status(200).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        cart: user.cart,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Initiate a login session
router.post("/login", async (req, res, next) => {
  try {
    if (!req.body.username) {
      return res.status(400).json({
        message: "The username field is missing",
      });
    } else if (!req.body.password) {
      return res.status(400).json({
        message: "The password field is missing",
      });
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        next(err);
      } else if (!user) {
        return res.status(400).json({
          message: "Incorrect credentials",
        });
      }

      req.login(user, (err) => {
        if (err) {
          next(err);
        }
        return res.status(200).json({
          message: "Login successful",
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            cart: user.cart,
          },
        });
      });
    })(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Terminate an existing login session
router.post("/logout", isAuth, async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.session.destroy(() => {
      res.status(200).json({
        message: "Logout successful",
      });
    });
  });
});

// Change password
router.put("/change-password", isAuth, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword) {
      return res.status(400).json({
        message: "The oldPassword field is missing",
      });
    } else if (!newPassword) {
      return res.status(400).json({
        message: "The newPassword field is missing",
      });
    }

    req.user.changePassword(oldPassword, newPassword, (err) => {
      if (err) {
        return res.status(401).json({
          message: "The old password is incorrect",
        });
      }

      res.status(200).json({
        message: "Password changed successfully",
      });
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
