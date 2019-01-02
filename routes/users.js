const { User, isValid } = require("../models/user");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = isValid(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { name, password, email } = req.body;

  let user = await User.findOne({ email: email });
  if (user) return res.status(400).send("User already registered.");

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  user = new User({
    name: name,
    password: password,
    email: email
  });

  const token = user.generateAuthToken();

  user.save();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
