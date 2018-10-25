const express = require("express");
const router = express.Router();
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const { Rental, isValid } = require("../models/rental");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const auth = require("../middleware/auth");

Fawn.init(mongoose);

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.post("/", auth, async (req, res) => {
  try {
    const { error } = isValid(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { customerId, movieId } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(400).send("Invalid customer");

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(400).send("Invalid movie");
    if (movie.numberInStock === 0)
      return res.status(400).send("Movie not available");

    let rental = new Rental({
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone
      },
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate
      }
    });

    try {
      new Fawn.Task()
        .save("rentals", rental)
        .update(
          "movies",
          { _id: movie._id },
          {
            $inc: { numberInStock: -1 }
          }
        )
        .run();

      res.send(rental);
    } catch (ex) {
      res.status(500).send("something failed. ");
    }
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
