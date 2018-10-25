const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("This website is about movies");
});

module.exports = router;
