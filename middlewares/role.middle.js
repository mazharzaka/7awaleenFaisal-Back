exports.checkRole = (roles, checkCreator = false) => {
  return async (req, res, next) => {
    try {
      // console.log(req.user);

      if (roles.includes(req.user.role)) {
        return next();
      }

      return res.status(403).json({ message: "Access denied" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
};
