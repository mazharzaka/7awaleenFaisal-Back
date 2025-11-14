const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

exports.createAccessToken = (data) => {
  return jwt.sign(data, process.env.SECRET_KEY, { expiresIn: "100d" });
};

exports.authMW = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      const verified = jwt.verify(token, process.env.SECRET_KEY);
      req.user = verified;
      console.log(req.user.userId);
      next();
    } else {
      res.status(401).json({ error: "Access denied, token missing" });
    }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
exports.Isuser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      const verified = jwt.verify(token, process.env.SECRET_KEY);
      req.user = verified;
      const user = await userModel
        .findById(req.user.userId)
        .populate("userType");
      // console.log(user);
      // console.log(req.user);
      if (user) {
        user.userType.desc === "user"
          ? next()
          : res.status(404).json({ error: "is not user" });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } else {
      res.status(401).json({ error: "Access denied, token missing" });
    }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
exports.Isadmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      const verified = jwt.verify(token, process.env.SECRET_KEY);
      req.user = verified;
      const user = await userModel
        .findById(req.user.userId)
        .populate("userType");
      // console.log(user);
      // console.log(req.user);
      if (user) {
        user.userType.desc === "admin"
          ? next()
          : res.status(404).json({ error: "is not admin" });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } else {
      res.status(401).json({ error: "Access denied, token missing" });
    }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
