const jsonwebtoken = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const secret = process.env.SECRET;

exports.generateAccessToken = (user) => {
  return jsonwebtoken.sign({ user }, secret, { expiresIn: "15m" });
};

exports.generateRefreshToken = (user) => {
  return jsonwebtoken.sign({ user }, secret, { expiresIn: "7d" });
};
