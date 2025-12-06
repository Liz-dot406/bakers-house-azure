import request from "supertest";
import app from "../../src/index";
import { getPool } from "../../src/db/config";

let pool: any;
let testCakeId: number;

beforeAll(async () => {
  pool = await getPool();

  // Insert a test cake to work with
  const result = await pool
    .request()
    .query(`
      INSERT INTO ReadyMade_Cakes (cakeName, flavorsUsed, size, imageURL, quantityAvailable, isactive)
      OUTPUT INSERTED.cakeId
      VALUES ('Test Chocolate Cake', 'Chocolate, Cocoa', 'Small', 'testcake.jpg', 5, 1);
    `);

  testCakeId = result.recordset[0].cakeId;
});

afterAll(async () => {
  await pool.request().query(`DELETE FROM ReadyMade_Cakes WHERE cakeName = 'Test Chocolate Cake';`);
  await pool.close();
});

describe("ReadyMade Cakes Controller Integration Tests", () => {
  it("should retrieve all cakes", async () => {
    const response = await request(app).get("/readycakes");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should retrieve a cake by ID", async () => {
    const response = await request(app).get(`/readycakes/${testCakeId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("cakeId", testCakeId);
  });

  it("should return 404 for a non-existing cake", async () => {
    const response = await request(app).get("/readycakes/999999");
    expect(response.statusCode).toBe(404);
  });

  it("should create a new cake", async () => {
    const response = await request(app).post("/readycakes").send({
      cakeName: "Integration Strawberry Cake",
      flavorsUsed: "Strawberry, Cream",
      size: "Medium",
      imageURL: "strawberry_test.jpg",
      quantityAvailable: 10,
      isactive: 1,
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("message", "Cake added successfully");

    // Clean up new cake
    const newCakeId = response.body.newCake.cakeId;
    await pool.request().query(`DELETE FROM ReadyMade_Cakes WHERE cakeId = ${newCakeId}`);
  });

  it("should update an existing cake", async () => {
    const response = await request(app)
      .put(`/readycakes/${testCakeId}`)
      .send({ size: "Large", quantityAvailable: 9 });
    expect(response.statusCode).toBe(200);
  });

  it("should delete an existing cake", async () => {
    // First, insert a cake to delete
    const result = await pool
      .request()
      .query(`
        INSERT INTO ReadyMade_Cakes (cakeName, flavorsUsed, size, imageURL, quantityAvailable, isactive)
        OUTPUT INSERTED.cakeId
        VALUES ('CakeToDelete', 'Vanilla', 'Small', 'delete_me.jpg', 2, 1);
      `);
    const deleteId = result.recordset[0].cakeId;

    const response = await request(app).delete(`/readycakes/${deleteId}`);
    expect(response.statusCode).toBe(200);
  });

  it("should return 404 when deleting a non-existing cake", async () => {
    const response = await request(app).delete("/readycakes/999999");
    expect(response.statusCode).toBe(404);
  });
});
