const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

const validateUserInput = (req, res, next) => {
  const { username, password } = req.body;
  if (!username.trim() || !password.trim()) {
    return res.status(400).json({ message: "Username and password cannot be empty" });
  }
  next();
};

router.post("/register", validateUserInput , async (req, res) => {
  const { username, password } = req.body;
  
  const hashedPassword = await bcrypt.hash(password,10);

  const user = new User({ username, password: hashedPassword }); 
  await user.save();
  res.json({ message: "User registered successfully" });
});


router.post("/login", validateUserInput , async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: "Invalid username or password" }); 
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

module.exports = router;