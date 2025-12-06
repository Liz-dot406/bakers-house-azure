import { Request, Response } from "express";
import { getPool } from "../db/config";
import * as DeliveryService from "../service/delivery.service";


export const scheduleDelivery = async (req: Request, res: Response) => {
  const {
    orderId,
    deliveryAddress,
    deliveryDate,
    courierName,
    courierContact,
    status,
  } = req.body;

  if (!orderId || !deliveryAddress || !deliveryDate) {
    return res.status(400).json({
      message:
        "Missing required fields: orderId, deliveryAddress, deliveryDate",
    });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("OrderID", orderId)
      .input("DeliveryAddress", deliveryAddress)
      .input("DeliveryDate", deliveryDate)
      .input("CourierName", courierName || null)
      .input("CourierContact", courierContact || null)
      .input("Status", status || "Scheduled")
      .query(`
        INSERT INTO Deliveries (OrderID, DeliveryAddress, DeliveryDate, CourierName, CourierContact, Status)
        OUTPUT INSERTED.*
        VALUES (@OrderID, @DeliveryAddress, @DeliveryDate, @CourierName, @CourierContact, @Status)
      `);

    const newDelivery = result.recordset[0];

    // Return both message and delivery object
    res.status(201).json({
      message: "Delivery scheduled successfully",
      delivery: newDelivery,
    });

  } catch (error) {
    console.error("Error scheduling delivery:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};


export const getAllDeliveries = async (_req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query("SELECT * FROM Deliveries ORDER BY CreatedAt DESC");

   res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getDeliveryById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("DeliveryID", id)
      .query("SELECT * FROM Deliveries WHERE DeliveryID = @DeliveryID");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({ delivery: result.recordset[0] });


    
  } catch (error) {
    console.error("Error fetching delivery by ID:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const updateDelivery = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { courierName, courierContact, Status } = req.body;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("DeliveryID", id)
      .input("CourierName", courierName || null)
      .input("CourierContact", courierContact || null)
      .input("Status", Status || null).query(`
        UPDATE Deliveries
        SET 
          CourierName = COALESCE(@CourierName, CourierName),
          CourierContact = COALESCE(@CourierContact, CourierContact),
          Status = COALESCE(@Status, Status),
          UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE DeliveryID = @DeliveryID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({ message: "Delivery updated successfully" });
  } catch (error) {
    console.error("Error updating delivery:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const deleteDelivery = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("DeliveryID", id)
      .query("DELETE FROM Deliveries WHERE DeliveryID = @DeliveryID");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({ message: "Delivery deleted successfully" });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
