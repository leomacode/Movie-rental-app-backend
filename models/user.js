const mongoose = require("mongoose");
require("mongoose-type-email");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 50,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255
  },

  isAdmin: {
    type: Boolean
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { _id: this.id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function isValid(user) {
  schema = {
    name: Joi.string()
      .min(3)
      .max(30)
      .required(),
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

exports.User = User;
exports.isValid = isValid;
