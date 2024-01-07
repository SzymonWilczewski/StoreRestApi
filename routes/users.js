const router = require("express").Router();
const { isAuth, isAdmin } = require("../utils/auth");
const User = require("../models/user");

// Get all users
router.get("/", isAdmin, async (req, res, next) => {
  try {
    const users = await User.find();

    return res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
});

// Get a user by id
router.get("/:id", isAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "The user does not exist",
      });
    } else if (user._id.equals(req.user._id) || req.user.admin) {
      return res.status(200).json({ user });
    } else {
      return res.status(200).json({
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
        },
      });
    }
  } catch (err) {
    next(err);
  }
});

// Modify a user
router.patch("/:id", isAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      firstName = user.firstName,
      lastName = user.lastName,
      username = user.username,
    } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "The user does not exist",
      });
    } else if (!(user._id.equals(req.user._id) || req.user.admin)) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    } else if (username !== user.username) {
      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) {
        return res.status(400).json({
          message: "Username is already taken",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, username },
      { new: true }
    );

    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Delete a user
router.delete("/:id", isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        message: "The user does not exist",
      });
    }

    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
