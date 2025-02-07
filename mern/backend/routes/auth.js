const express = require("express");
const router = express.Router();
const User = require("../models/users");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");

router.get("/signup", (req, res) => {
  res.send("hello world");
});
router.post(
  "/signup",
  body("name").trim().isLength({ min: 4 }),
  body("email").trim().isEmail(),
  body("password").trim().isLength({ min: 8 }),
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({
          errors: error.array(),
          message: "invalid data",
        });
      }
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      const { name, email, password } = req.body;
      const newUser = await new User({
        name,
        email,
        password: hashPassword,
      });

      newUser.save().then(() => {
        res.json("user saved");
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get("/login", (req, res) => {
  res.send("login page");
});
router.post(
  "/login",
  body("email").trim().isEmail(),
  body("password").trim().isLength({ min: 8 }),
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({
          errors: error.array(),
          message: "invalid data",
        });
      }
    } catch (err) {
      console.log(err);
    }
    try {
      const { email, password } = req.body;
      const foundUser = await User.findOne({ email });
      if (!foundUser) {
        return res.status(400).json({ message: "User not found" });
      }
      const isMatch = await bcrypt.compare(password, foundUser.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        { userID: foundUser._id },
        process.env.JWT_SECRET || "sha5566"
      );
      res.cookie("token", token, {
        httpOnly: true,
      });
      res.setHeader("Authorization", `Bearer ${token}`);
      res.json({ message: "Logged in", user: foundUser, token });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

//logout
router.get("/logout", (req, res) => {
  res.clearCookie(token);
  res.redirect("/");
});

module.exports = router;
