const express = require("express");
const router = express.Router();
const { Genre, isValid } = require("../models/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const asyncMiddleware = require("../middleware/async");
const mongoose = require("mongoose");
const ValidateObjectId = require("../middleware/validateObjectId");

router.get("/", async (req, res) => {
  const genres = await Genre.find();
  res.send(genres);
});

router.get("/:id", ValidateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) {
    return res.status(404).send("Gengre with this ID was not found");
  } else {
    return res.send(genre);
  }
});

router.post("/", auth, async (req, res) => {
  const { error } = isValid(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    let genre = new Genre({
      name: req.body.name
    });

    try {
      genre = await genre.save();
    } catch (err) {
      console.log(err.message);
    }
    res.send(genre);
  }
});

router.put("/:id", auth, async (req, res) => {
  const { error } = isValid(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  if (!genre) return res.status(404).send("Gengre with this ID was not found");
  res.send(genre);
});

router.delete("/:id", [auth, admin, ValidateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) {
    return res.status(404).send("Gengre with this ID was not found");
  }

  res.send(genre);
});

module.exports = router;
