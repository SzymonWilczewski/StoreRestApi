const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return next({ message: "Unauthorized" });
};

const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin) {
    return next();
  }
  return next({ message: "Unauthorized" });
};

module.exports = { isAuth, isAdmin };
