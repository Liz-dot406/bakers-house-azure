import request from "supertest";
import app from "../../src/index";
import { getPool } from "../../src/db/config";

let pool: any;
let testUserId: number;
let testOrderId: number;
let testStageId: number;

beforeAll(async () => {
  pool = await getPool();

  // Insert dummy user
  const userResult = await pool.request()
    .input("name", "testuser")
    .input("email", "testuser@example.com")
    .input("password", "testpass")
    .input("phone", "1234567890") // REQUIRED
    .input("address", "Test Address") // optional, but good to include
    .input("role", "customer") // optional
    .query(`
      INSERT INTO Users (name, email, password, phone, address, role)
      OUTPUT INSERTED.userid
      VALUES (@name, @email, @password, @phone, @address, @role)
    `);

  testUserId = userResult.recordset[0].userid;

  // Insert dummy order
  const orderResult = await pool.request()
    .input("userid", testUserId)
    .input("DesignId", 1)
    .input("Size", "Large")
    .input("Flavor", "Chocolate")
    .input("Message", "Test Cake")
    .input("Status", "Pending")
    .input("DeliveryDate", new Date())
    .query(`
      INSERT INTO Cake_Orders (userid, DesignId, Size, Flavor, Message, Status, DeliveryDate)
      OUTPUT INSERTED.Id
      VALUES (@userid, @DesignId, @Size, @Flavor, @Message, @Status, @DeliveryDate)
    `);
  testOrderId = orderResult.recordset[0].Id;

  // Insert dummy stage
  const stageResult = await pool.request()
    .input("OrderId", testOrderId)
    .input("StageName", "Baking")
    .query(`
      INSERT INTO Cake_Stages (OrderId, StageName)
      OUTPUT INSERTED.Id
      VALUES (@OrderId, @StageName)
    `);
  testStageId = stageResult.recordset[0].Id;
});


afterAll(async () => {
  await pool.request().query(`DELETE FROM Cake_Stages`);
  await pool.request().query(`DELETE FROM Cake_Orders`);
  await pool.request().query(`DELETE FROM Users`);
  await pool.close();
});

describe("Stages Controller Integration Tests", () => {

  it("should create a new stage", async () => {
    const res = await request(app)
      .post("/stages")
      .send({
        OrderId: testOrderId,
        StageName: "Decorating"
      });
    expect(res.status).toBe(201);
  });

  it("should fetch all the stages", async () => {
    const res = await request(app).get("/stages");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should fetch stage by OrderId", async () => {
    const res = await request(app).get(`/stages/order/${testOrderId}`);
    expect(res.status).toBe(200);
  });

  it("should fetch stage details by StageId", async () => {
    const res = await request(app).get(`/stages/${testStageId}`);
    expect(res.status).toBe(200);
  });

  it("should update stage by StageId", async () => {
    const res = await request(app)
      .patch(`/stages/${testStageId}`)
      .send({ StageName: "Baking Complete" });
    expect(res.status).toBe(200);
  });

  it("should complete stage by StageId", async () => {
    const res = await request(app)
      .post(`/stages/${testStageId}/complete`);
    expect(res.status).toBe(200);
  });

  it("should return 404 for non-existing StageId", async () => {
    const res = await request(app).get("/stages/99999");
    expect(res.status).toBe(404);
  });

  it("should delete stage by StageId", async () => {
    const res = await request(app).delete(`/stages/${testStageId}`);
    expect(res.status).toBe(200);
  });

});
