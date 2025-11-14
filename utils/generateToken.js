const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const secret = process.env.SECRET;

exports.generateToken = (user) => {
    return jsonwebtoken.sign({ user }, secret, { expiresIn: '24h' });
}