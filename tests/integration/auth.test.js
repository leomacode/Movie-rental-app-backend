const request = require("supertest");
const { User } = require("../../models/user");
const { Genre } = require("../../models/genre");

describe("MidddleWare Auth test", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    await Genre.remove({});
  });

  let token;

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  const exc = () => {
    return request(server)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
  };

  it("should return 401 if no token is provided", async () => {
    token = "";
    const res = await exc();
    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid", async () => {
    token = "a";
    res = await exc();
    expect(res.status).toBe(400);
  });

  it("should return 200 if the token is valid", async () => {
    res = await exc();
    expect(res.status).toBe(200);
  });
});
