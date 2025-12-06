import request from "supertest";
import app from "../../src/index";
import { getPool } from "../../src/db/config";
import bcrypt from "bcryptjs";

let pool: any;

// Helper functions to generate unique email and phone
const randomEmail = () => `testuser${Date.now()}@testmail.com`;
const randomPhone = () => `07${Math.floor(10000000 + Math.random() * 90000000)}`;

beforeAll(async () => {
  pool = await getPool();
});

afterAll(async () => {
  // Clean up all test users
  await pool.request().query("DELETE FROM Users WHERE email LIKE '%@testmail.com'");
  await pool.close();
});

describe("User API Integration Test Suite", () => {
  let testUser: { email: string; phone: string; password: string };

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("testpass123", 10);
    const email = randomEmail();
    const phone = randomPhone();

    await pool.request().query(`
      INSERT INTO Users (name, email, phone, address, password, role, is_verified)
      VALUES ('Testuser','${email}','${phone}','Test Address','${hashedPassword}','user', 1)
    `);

    testUser = { email, phone, password: "testpass123" };
  });

  afterEach(async () => {
    await pool.request().query("DELETE FROM Users WHERE email LIKE '%@testmail.com'");
  });

  it("should authenticate a user and return a token", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.message).toMatch(/login successful/i);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("should fail with wrong password", async () => {
    const res = await request(app).post("/users/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should fail with non-existent user on login", async () => {
    const res = await request(app).post("/users/login").send({
      email: "nonexistent@testmail.com",
      password: "testpass123",
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/user not found/i);
  });

  it("should fetch all users successfully", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should create a new user successfully", async () => {
    const newUser = {
      name: "Brian Tanui",
      email: randomEmail(),
      phone: randomPhone(),
      password: "securePass123",
      address: "Test Address",
    };

    const res = await request(app).post("/users/register").send(newUser);
    expect(res.statusCode).toBe(201);
  });

  it("should fail to create a user with missing fields", async () => {
    const res = await request(app).post("/users/register").send({ name: "Elizabeth" });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should fail to create a user with duplicate email", async () => {
    const newUser = {
      name: "user",
      email: testUser.email, // Duplicate email from seeded user
      phone: randomPhone(),
      password: "securePass123",
    };

    const res = await request(app).post("/users/register").send(newUser);
    expect(res.status).toBe(500);
  });

  it("should return user by ID", async () => {
    const inserted = await pool
      .request()
      .query(
        `INSERT INTO Users (name, email, phone, password, role, address) OUTPUT INSERTED.userid 
         VALUES ('John Smith', '${randomEmail()}', '${randomPhone()}', 'pass123', 'user', 'Test Address')`
      );

    const userid = inserted.recordset[0].userid;
    const res = await request(app).get(`/users/${userid}`);

    expect(res.status).toBe(200);
    expect(res.body.userid).toBe(userid);
  });

  it("should return 404 if user not found", async () => {
    const res = await request(app).get("/users/99999999");
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/user not found/i);
  });

  it("should return 400 when updating with invalid ID", async () => {
    const res = await request(app).put("/users/abc").send({ name: "BadId" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid user id/i);
  });

  it("should return 404 when updating non-existent user", async () => {
    const res = await request(app).put("/users/999999").send({ name: "Ghost" });
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/user not found/i);
  });

  it("should delete a user successfully", async () => {
    const inserted = await pool
      .request()
      .query(
        `INSERT INTO Users (name, email, phone, password, role, address) OUTPUT INSERTED.userid 
         VALUES ('Alice Brown', '${randomEmail()}', '${randomPhone()}', 'pass456', 'user', 'Test Address')`
      );

    const userid = inserted.recordset[0].userid;
    const res = await request(app).delete(`/users/${userid}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/user deleted successfully/i);
  });

  it("should return 400 for invalid user ID on delete", async () => {
    const res = await request(app).delete("/users/abc");
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid user id/i);
  });

  it("should return 404 for non-existent user on delete", async () => {
    const res = await request(app).delete("/users/99999999");
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/user not found/i);
  });

  it("should fail verifying without email or code", async () => {
    const res = await request(app).post("/users/verify").send({});
    expect(res.status).toBe(400);
    expect(res.body.message.trim()).toMatch(/email and verification code are required/i);

  });

 it("should fail verifying non-existent user", async () => {
  const res = await request(app).post("/users/verify").send({
    email: "notexist@test.com",
    verification_code: 123456, 
  });
  expect(res.status).toBe(404);
});

});
