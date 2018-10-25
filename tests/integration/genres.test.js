let server;
const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
const mongoose = require("mongoose");

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    await Genre.remove({});
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" }
      ]);
      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /:id", () => {
    it("should return the correct status code if pass a valid id", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const res = await request(server).get("/api/genres/" + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return 404 code if pass an invalid id", async () => {
      const res = await request(server).get("/api/genres/1");
      expect(res.status).toBe(404);
    });

    it("should return 404 code if pass an id which is not existing", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/genres/" + id);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const exc = async () => {
      return request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exc();
      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 5 characters", async () => {
      name = "1234";
      const res = await exc();
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 50 characters", async () => {
      name = new Array(53).join("a");
      const res = await exc();
      expect(res.status).toBe(400);
    });

    it("should save genre if it is valid", async () => {
      const res = await exc();
      const genre = await User.find({ name: "genre1" });
      expect(genre).not.toBeNull;
    });

    it("should return the genre if it is valid", async () => {
      const res = await exc();
      expect(res.body).toHaveProperty("name", "genre1");
      expect(res.body).toHaveProperty("_id");
    });
  });

  describe("PUT /", () => {
    let id;
    let token;
    let newName;
    let genre;

    const exc = () => {
      return request(server)
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name: newName });
    };

    beforeEach(async () => {
      genre = new Genre({ name: "genre1" });
      await genre.save();
      id = genre.id;
      token = new User().generateAuthToken();
      newName = "Genre2";
    });

    it("should return 401 if it is not logged in", async () => {
      token = "";
      const res = await exc();
      expect(res.status).toBe(401);
    });

    it("should return 400 if it is logged in with invalid user", async () => {
      token = "1";
      const res = await exc();
      expect(res.status).toBe(400);
    });

    it("should return 404 if the name is less than 5 characters", async () => {
      newName = "1234";
      const res = await exc();
      expect(res.status).toBe(404);
    });

    it("should return 404 if the name is more than 50 characters", async () => {
      newName = new Array(52).join("a");
      const res = await exc();
      expect(res.status).toBe(404);
    });

    it("should return 404 if given id is not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exc();
      expect(res.status).toBe(404);
    });

    it("should update the genre if input is valid", async () => {
      const res = await exc();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", newName);
    });

    it("should update the genre if input is valid", async () => {
      const res = await exc();
      const updatedGenre = await Genre.findById(id);
      expect(updatedGenre.name).toBe(newName);
    });

    it("should return the genre ", async () => {
      const res = await exc();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", newName);
    });
  });

  describe("DELETE /", () => {
    let token;
    let id;
    let genre;

    beforeEach(async () => {
      genre = new Genre({ name: "genre1" });
      await genre.save();
      id = genre._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    const exc = () => {
      return request(server)
        .delete("/api/genres/" + id)
        .set("x-auth-token", token)
        .send();
    };

    it("should return 401 if the user is not logged in", async () => {
      token = " ";
      const res = await exc();
      expect(res.status).toBe(401);
    });

    it("should return 400 if the user is not valid", async () => {
      token = "1";
      const res = await exc();
      expect(res.status).toBe(400);
    });

    it("should return 403 if the user is not admin", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();
      const res = await exc();
      expect(res.status).toBe(403);
    });

    it("should return 404 if the id is invalid", async () => {
      id = "1";
      const res = await exc();
      expect(res.status).toBe(404);
    });

    it("should return 404 if the id is not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exc();
      expect(res.status).toBe(404);
    });

    it("should delete the genren if input is valid", async () => {
      const res = await exc();
      const genreInDB = await Genre.findById(id);
      expect(genreInDB).toBeNull;
    });

    it("should return removed genre", async () => {
      const res = await exc();
      expect(res.body).toHaveProperty("_id", genre._id.toHexString());
      expect(res.body).toHaveProperty("name", genre.name);
    });
  });
});
