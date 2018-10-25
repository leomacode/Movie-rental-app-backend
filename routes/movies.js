const { Movie, isValid } = require("../models/movie");
const express = require("express");
const router = express.Router();
const { Genre } = require("../models/genre");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.send(movies);
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("Movie with this ID was not found");
    res.send(movie);
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/", auth, async (req, res) => {
  const { error } = isValid(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { title, genreId, numberInStock, dailyRentalRate } = req.body;

  const genre = await Genre.findById({ _id: genreId });
  if (!genre) return res.status(400).send("Invalid genre");

  const movie = new Movie({
    title: title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock: numberInStock,
    dailyRentalRate: dailyRentalRate
  });
  movie.save();
  res.send(movie);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = isValid(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { title, genreId, numberInStock, dailyRentalRate } = req.body;

  const genre = await Genre.findById({ _id: genreId });
  if (!genre) return res.status(400).send("Invalid genre");

  movie = await Movie.update(
    { _id: req.params.id },
    {
      $set: {
        title: title,
        genre: {
          _id: genre._id,
          name: genre.name
        },
        numberInStock: numberInStock,
        dailyRentalRate: dailyRentalRate
      }
    }
  );
  if (!movie) return res.status(400).send("This movie was not found");
  movie = await Movie.findById(req.params.id);
  res.send(movie);
});

router.delete("/:id", auth, async (req, res) => {
  const movie = await Movie.findByIdAndRemove({ _id: req.params.id });
  if (!movie) return res.status(400).send("This movie was not found");
  res.send(movie);
});

module.exports = router;
