const { OAuth2Client } = require("google-auth-library");
const sendEmail = require("../utils/email");
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
    let role = "CUSTOMER";
    let isApproved = true; // Customers are approved by default
    let accountStatus = "APPROVED";

    if (userType === "delivery" || userType === "DRIVER") {
      role = "DRIVER";
      isApproved = false;
      accountStatus = "PENDING";
    } else if (userType === "admin") {
      role = "ADMIN";
    } else if (userType === "vendor" || userType === "storeOwner") {
      role = "ADMIN"; // Or a specific VENDOR role if you want to add it later
    }

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      formattedAddress,
      location,
      userType, 
      role,
      isApproved,
      accountStatus,
    });

    // حذف الباسورد من response
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
      maxExpiry: 86400, // Handle tokens valid for up to 24 hours
    });
    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await userModel.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await userModel.create({
        name,
        email,
        googleId,
        userType: "customer",
        password: "", // No password for Google users
      });
    }

    const accessToken = generateToken.generateAccessToken({
      userId: user._id,
      name: user.name,
      userType: user.userType,
      role: user.role,
      isApproved: user.isApproved,
      accountStatus: user.accountStatus,
      isOnline: user.isOnline,
    });

    const refreshToken = generateToken.generateRefreshToken({
      userId: user._id,
      name: user.name,
      userType: user.userType,
      role: user.role,
      isApproved: user.isApproved,
      accountStatus: user.accountStatus,
      isOnline: user.isOnline,
    });

    res.status(200).json({ accessToken, refreshToken, user });
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

    if (!user.password && user.googleId) {
         return res.status(400).json({ error: "Please login with Google" });
    }
    
    const isMatch = await hashing.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password does not match" });
    }
    
    // 2FA Flow: Generate and Send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    
    const message = `Your OTP for login is ${otp}. It expires in 10 minutes.`;
    console.log(message);
    
    // Send Email
    try {
        await sendEmail({
            email: user.email,
            subject: "Your Login OTP",
            message,
            html: `<h1>Your Login OTP is ${otp}</h1><p>It expires in 10 minutes.</p>`
        });
        // Return success but NO tokens yet
        res.status(200).json({ message: "OTP sent to email. Please verify.", requireOtp: true, email: user.email });
    } catch (emailError) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.status(500).json({ error: "Email could not be sent", details: emailError.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh Token is required" });
    }

    const jwt = require("jsonwebtoken");
    const secret = process.env.SECRET;

    jwt.verify(refreshToken, secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid Refresh Token" });
      }

      const accessToken = generateToken.generateAccessToken(decoded.user);
      res.status(200).json({ accessToken });
    });
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

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and expiry (10 minutes)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const message = `Your OTP is ${otp}. It expires in 10 minutes.`;
    
    // Send Email
    const sendEmail = require("../utils/email");
    try {
        await sendEmail({
            email: user.email,
            subject: "Your OTP Code",
            message,
            html: `<h1>Your OTP is ${otp}</h1><p>It expires in 10 minutes.</p>`
        });
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (emailError) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.status(500).json({ error: "Email could not be sent", details: emailError.message });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.otp || !user.otpExpires) {
         return res.status(400).json({ error: "OTP not set or expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Optionally generate token here or just return success
    // If this is for login, we should generate tokens. 
    // If for just verification, return success.
    // Let's assume it logs the user in for now.
    
    const token = generateToken.generateAccessToken({
        userId: user._id,
        name: user.name,
        userType: user.userType,
        role: user.role,
        isApproved: user.isApproved,
        accountStatus: user.accountStatus,
        isOnline: user.isOnline,
    });
     const refreshToken = generateToken.generateRefreshToken({
        userId: user._id,
        name: user.name,
        userType: user.userType,
        role: user.role,
        isApproved: user.isApproved,
        accountStatus: user.accountStatus,
        isOnline: user.isOnline,
    });

    res.status(200).json({ message: "OTP verified successfully", accessToken: token, refreshToken, user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user has a password (not a Google login user without password)
    if (user.password) {
      const isMatch = await hashing.comparePassword(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Old password does not match" });
      }
    }

    user.password = await hashing.hashPassword(newPassword);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
