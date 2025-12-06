import request from "supertest";
import app from "../../src/index";
import { getPool } from "../../src/db/config";

let pool: any;
let testDeliveryId: number;

beforeAll(async () => {
  pool = await getPool();

  // Insert a test delivery before running tests
  const result = await pool.request().query(`
    INSERT INTO Deliveries 
      (OrderID, DeliveryAddress, DeliveryDate, CourierName, CourierContact, Status)
    OUTPUT INSERTED.DeliveryID
    VALUES 
      (501, 'Test Address, Nyeri', '2025-11-05 10:00:00', 'TestCourier', '+254711111111', 'Scheduled')
  `);

  testDeliveryId = result.recordset[0].DeliveryID;
});

afterAll(async () => {
  // Clean up test data
  await pool.request().query(`
    DELETE FROM Deliveries 
    WHERE DeliveryAddress IN ('Test Address, Nyeri', 'Delete Me Address', 'New Test Delivery', 'Updated Address')
  `);
  await pool.close();
});

describe("Delivery Controller Integration Tests", () => {
  it("should retrieve all deliveries", async () => {
    const response = await request(app).get("/api/deliveries");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should retrieve a delivery by ID", async () => {
    const response = await request(app).get(`/api/deliveries/${testDeliveryId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.delivery).toHaveProperty("DeliveryID", testDeliveryId);
  });

  it("should return 404 for a non-existing delivery", async () => {
    const response = await request(app).get("/api/deliveries/999999");
    expect(response.statusCode).toBe(404);
  });

  it("should create a new delivery", async () => {
    const response = await request(app).post("/api/deliveries").send({
      orderId: 502,
      deliveryAddress: "New Test Delivery",
      deliveryDate: "2025-11-06T09:00:00",
      CourierName: "FastDrop",
      CourierContact: "+254722222222",
      Status: "Scheduled",
    });
  console.log("Create delivery response body:", JSON.stringify(response.body, null, 2));

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Delivery scheduled successfully"
    );
  });

  it("should update an existing delivery", async () => {
    const response = await request(app).put(`/api/deliveries/${testDeliveryId}`).send({
      OrderID: 501,
      DeliveryAddress: "Updated Address",
      DeliveryDate: "2025-11-07T10:00:00",
      CourierName: "UpdatedCourier",
      CourierContact: "+254733333333",
      Status: "Delivered",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Delivery updated successfully"
    );
  });

  it("should delete an existing delivery", async () => {
    // Insert a temporary delivery to delete
    const result = await pool.request().query(`
      INSERT INTO Deliveries 
        (OrderID, DeliveryAddress, DeliveryDate, CourierName, CourierContact, Status)
      OUTPUT INSERTED.DeliveryID
      VALUES 
        (503, 'Delete Me Address', '2025-11-08 15:00:00', 'TempCourier', '+254744444444', 'Scheduled')
    `);

    const deleteId = result.recordset[0].DeliveryID;

    const response = await request(app).delete(`/api/deliveries/${deleteId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Delivery deleted successfully"
    );
  });

  it("should return 404 when deleting a non-existing delivery", async () => {
    const response = await request(app).delete("/api/deliveries/9999999");
    expect(response.statusCode).toBe(404);
  });
});
