import { getPool } from "../db/config";
import { Delivery, DeliveryUpdate } from "../types/delivery.types";

export const getAllDeliveries = async () => {
  const pool = await getPool();
  const result = await pool.request().query("SELECT * FROM Deliveries");
  return result.recordset;
};

export const getDeliveryById = async (DeliveryID: number) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("DeliveryID", DeliveryID)
    .query("SELECT * FROM Deliveries WHERE DeliveryID = @DeliveryID");
  return result.recordset[0];
};

export const createDelivery = async (delivery: Delivery) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("OrderID", delivery.OrderID)
    .input("DeliveryAddress", delivery.DeliveryAddress)
    .input("DeliveryDate", delivery.DeliveryDate)
    .input("CourierName", delivery.CourierName || null)
    .input("CourierContact", delivery.CourierContact || null)
    .input("Status", delivery.Status || "Scheduled")
    .query(
      `INSERT INTO Deliveries 
       (OrderID, DeliveryAddress, DeliveryDate, CourierName, CourierContact, Status)
       OUTPUT INSERTED.DeliveryID
       VALUES (@OrderID, @DeliveryAddress, @DeliveryDate, @CourierName, @CourierContact, @Status)`
    );

  return { data: { DeliveryID: result.recordset[0].DeliveryID } };
};

export const updateDelivery = async (DeliveryID: number, delivery: DeliveryUpdate) => {
  const pool = await getPool();
  await pool
    .request()
    .input("DeliveryID", DeliveryID)
    .input("DeliveryAddress", delivery.DeliveryAddress)
    .input("DeliveryDate", delivery.DeliveryDate)
    .input("CourierName", delivery.CourierName)
    .input("CourierContact", delivery.CourierContact)
    .input("Status", delivery.Status)
    .query(
      `UPDATE Deliveries 
       SET DeliveryAddress=@DeliveryAddress, DeliveryDate=@DeliveryDate, 
           CourierName=@CourierName, CourierContact=@CourierContact, 
           Status=@Status, UpdatedAt=GETDATE()
       WHERE DeliveryID=@DeliveryID`
    );

  return { message: "Delivery updated successfully" };
};

export const deleteDelivery = async (DeliveryID: number) => {
  const pool = await getPool();
  await pool
    .request()
    .input("DeliveryID", DeliveryID)
    .query("DELETE FROM Deliveries WHERE DeliveryID=@DeliveryID");

  return { message: "Delivery deleted successfully" };
};
