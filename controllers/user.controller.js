const userModel = require("../models/user.model");
const hashing = require("../utils/hash");
const generateToken = require("../utils/generateToken");

exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      formattedAddress,
      location,
      userType,
    } = req.body;

    // تحقق لو الإيميل موجود بالفعل
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // عمل Hash لكلمة المرور
    const hashedPassword = await hashing.hashPassword(password);

    // إنشاء المستخدم
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      formattedAddress,
      location,
      userType, // لو محدد هياخد القيمة، وإلا default 'customer'
    });

    // حذف الباسورد من response
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email not found" });
    }

    const isMatch = await hashing.isMatch(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password does not match" });
    }

    // إنشاء Access Token
    const token = generateToken.createAccessToken({
      userId: user._id,
      name: user.name,
      userType: user.userType,
    });

    res.status(200).json({ accessToken: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password"); // exclude password
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
