import { getPool } from "../db/config";
import { Delivery } from "../types/delivery.types";

export const getAllDeliveries = async (): Promise<Delivery[]> => {
  const pool = await getPool();
  const result = await pool.request().query("SELECT * FROM Deliveries");
  return result.recordset;
};

export const getDeliveryById = async (id: number): Promise<Delivery | null> => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", id)
    .query("SELECT * FROM Deliveries WHERE id = @id");
  return result.recordset[0] || null;
};

export const createDelivery = async (delivery: Delivery): Promise<void> => {
  const pool = await getPool();
  await pool
    .request()
    .input("order_id", delivery.DeliveryID)
    .input("delivery_date", delivery.DeliveryDate)
    .input("status", delivery.Status)
    .query(
      "INSERT INTO Deliveries (order_id, delivery_date, status) VALUES (@order_id, @delivery_date, @status)",
    );
};

export const updateDelivery = async (
  id: number,
  delivery: Delivery,
): Promise<void> => {
  const pool = await getPool();
  await pool
    .request()
    .input("id", id)
    .input("order_id", delivery.Order_id)
    .input("delivery_date", delivery.DeliveryDate)
    .input("status", delivery.Status)
    .query(
      `UPDATE Deliveries 
       SET order_id = @order_id, delivery_date = @delivery_date, status = @status
       WHERE id = @id`,
    );
};

export const deleteDelivery = async (id: number): Promise<void> => {
  const pool = await getPool();
  await pool
    .request()
    .input("id", id)
    .query("DELETE FROM Deliveries WHERE id = @id");
};
