const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");
const { User } = require("../models/user");

router.post("/", async (req, res) => {
  try {
    const { error } = isValid(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).send("Invalid email or password");

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) return res.status(400).send("Invalid password or password");

    const token = user.generateAuthToken();

    res.send(token);
  } catch (err) {
    console.log(err);
  }
});

function isValid(user) {
  schema = {
    password: Joi.string()
      .min(3)
      .max(255)
      .required(),
    email: Joi.string()
      .email()
      .required()
  };
  return Joi.validate(user, schema);
}

module.exports = router;
