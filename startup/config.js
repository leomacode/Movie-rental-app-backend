const config = require("config");

module.exports = function() {
  // export vidly_jwtPrivateKey=mySecureKey
  if (!config.get("jwtPrivateKey")) {
    throw new Error("Error: jwtPrivateKey is not defined");
  }
};
