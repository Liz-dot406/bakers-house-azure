import request from "supertest";
import app from "../../src/index";
import { getPool } from "../../src/db/config";

let pool: any;
let testOrderId: number; // dynamically store inserted order ID

beforeAll(async () => {
  pool = await getPool();

  // Insert a test order and capture its ID
  const result = await pool.query(`
    INSERT INTO Cake_Orders
      (DesignId, UserId, Size, Flavor, Message, Status, DeliveryDate, Notes, ExtendedDescription, SampleImages, ColorPreferences)
    OUTPUT INSERTED.Id
    VALUES
      (2, 9999, 'Medium', 'Vanilla', 'Happy Birthday!', 'Pending', '2023-12-25', 'No nuts, please.', 'Extra layers of chocolate', 'image1.jpg,image2.jpg', 'Red, Blue')
  `);

  testOrderId = result.recordset[0].Id;
});

afterAll(async () => {
  await pool.query(`DELETE FROM Cake_Orders WHERE UserId = 9999`);
  await pool.close();
});

describe("Orders Controller Integration Tests", () => {

  it("should create a new order", async () => {
    const response = await request(app).post("/orders").send({
      DesignId: 2,
      userid: 9999,
      Size: "Medium",
      Flavor: "Vanilla",
      Message: "Happy Birthday!",
      Status: "Pending",
      DeliveryDate: "2023-12-25",
      Notes: "No nuts, please.",
      ExtendedDescription: "Extra layers of chocolate",
      SampleImages: ["image1.jpg", "image2.jpg"],
      ColorPreferences: ["Red", "Blue"]
    });

    expect(response.status).toBe(201);
  });

  it("should retrieve all orders", async () => {
    const response = await request(app).get("/orders");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should retrieve an order by ID", async () => {
    const response = await request(app).get(`/orders/${testOrderId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("Id", testOrderId);
  });

  it("should update order status", async () => {
    const response = await request(app)
      .patch(`/orders/${testOrderId}`)
      .send({ Status: "Pending" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "Order status updated successfully");
  });

  it("Should return 404 for non-existing order", async () => {
    const response = await request(app).get("/orders/999999");
    expect(response.statusCode).toBe(404);
  });

  it("should return the orders for a specific user", async () => {
    const response = await request(app).get("/orders/user/9999");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });


  it("Should return 404 when deleting non-existing order", async () => {
    const response = await request(app).delete("/orders/9999999");

    expect(response.statusCode).toBe(404);
  });

 it("should update order details", async () => {
    const response = await request(app)
      .patch(`/orders/${testOrderId}/details`)
      .send({
        Size: "Large",
        Flavor: "Chocolate",
        Message: "Congratulations!",
        SampleImages: ["image1.jpg", "image2.jpg"],
        ColorPreferences: ["Red"]
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "Order details updated successfully");
  });




  it("should delete an order", async () => {
    const response = await request(app).delete(`/orders/${testOrderId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "Order deleted successfully");
  });

});
