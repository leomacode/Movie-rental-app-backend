const { Rental } = require("../../models/rental");
const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../models/user");
const moment = require("moment");
const { Movie } = require("../../models/movie");

describe("/apis/returns /", () => {
  let server;
  let customerId;
  let movieId;
  let rental;
  let token;
  let movie;

  beforeEach(async () => {
    server = require("../../index");

    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();

    rental = new Rental({
      customer: { _id: customerId, name: "12345", phone: "12345" },
      movie: { _id: movieId, title: "abcde", dailyRentalRate: 2 }
    });
    await rental.save();

    token = new User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: "abcde",
      genre: { name: "action" },
      numberInStock: 1,
      dailyRentalRate: 2
    });
    await movie.save();
  });

  afterEach(async () => {
    await server.close();
    await Rental.remove({});
    await Movie.remove({});
  });

  const exc = () => {
    return request(server)
      .post("/api/returns/")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
  };

  it("should return 401 if client is not logged in", async () => {
    token = "";
    const res = await exc();
    expect(res.status).toBe(401);
  });

  it("should return 400 if customerId is not provided", async () => {
    customerId = "";
    const res = await exc();
    expect(res.status).toBe(400);
  });

  it("should return 400 if movieId is not provided", async () => {
    movieId = "";
    const res = await exc();
    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental found for this customer or movie", async () => {
    await Rental.remove({});
    const res = await exc();
    expect(res.status).toBe(404);
  });

  it("should return 400 if the rental is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();
    const res = await exc();
    expect(res.status).toBe(400);
  });

  it("should return 200 if get a valid request", async () => {
    const res = await exc();
    expect(res.status).toBe(200);
  });

  it("should set the return date when processing", async () => {
    rental.dateReturned = new Date();
    await rental.save();
    const res = await exc();
    const rentalDB = await Rental.findById(rental._id);
    const diff = new Date() - rental.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should calculate the rental fee if the input is valid", async () => {
    rental.dateOut = moment()
      .add(-7, "days")
      .toDate();

    await rental.save();

    const res = await exc();

    const rentalDB = await Rental.findById(rental._id);
    expect(rentalDB.rentalFee).toBe(14);
  });

  it("should increase the movie stock", async () => {
    const res = await exc();
    const movieInDB = await Movie.findById(movieId);
    expect(movieInDB.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the rental if the input is valid", async () => {
    const res = await exc();

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "dateOut",
        "dateReturned",
        "rentalFee",
        "customer",
        "movie"
      ])
    );
  });
});
