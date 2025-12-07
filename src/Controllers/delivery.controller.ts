import { Request, Response } from "express";
import * as DeliveryService from "../service/delivery.service";

export const getAllDeliveries = async (req: Request, res: Response) => {
  try {
    const deliveries = await DeliveryService.getAllDeliveries();
    console.log("Deliveries fetched:", deliveries);  // <-- IMPORTANT
    return res.status(200).json({ data: deliveries });
  } catch (error: any) {
    console.error("🔥 ERROR in getAllDeliveries:", error); // <-- WE NEED THIS
    return res.status(500).json({ message: "Error fetching deliveries", error });
  }
};





export const getDeliveryById = async (req: Request, res: Response) => {
  const deliveryID = parseInt(req.params.id);
  if (isNaN(deliveryID)) {
    return res.status(400).json({ message: "Invalid delivery ID" });
  }

  try {
    const delivery = await DeliveryService.getDeliveryById(deliveryID);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    res.status(200).json({ data: delivery });
  } catch (error: any) {
    console.error("Error fetching delivery by ID:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const scheduleDelivery = async (req: Request, res: Response) => {
  const deliveryData = req.body;
  try {
    const delivery = await DeliveryService.scheduleDelivery(deliveryData);
    res.status(201).json(delivery);
  } catch (error: any) {
    console.error("Error scheduling delivery:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const updateDelivery = async (req: Request, res: Response) => {
  const deliveryID = parseInt(req.params.id);
  if (isNaN(deliveryID)) {
    return res.status(400).json({ message: "Invalid delivery ID" });
  }
  const deliveryData = req.body;
  try {
    const updated = await DeliveryService.updateDelivery(deliveryID, deliveryData);
    res.status(200).json(updated);
  } catch (error: any) {
    if (error.message === "Delivery not found") {
      return res.status(404).json({ message: "Delivery not found" });
    }
    console.error("Error updating delivery:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const deleteDelivery = async (req: Request, res: Response) => {
  const deliveryID = parseInt(req.params.id);
  if (isNaN(deliveryID)) {
    return res.status(400).json({ message: "Invalid delivery ID" });
  }

  try {
    const deleted = await DeliveryService.deleteDelivery(deliveryID);
    res.status(200).json(deleted);
  } catch (error: any) {
    if (error.message === "Delivery not found") {
      return res.status(404).json({ message: "Delivery not found" });
    }
    console.error("Error deleting delivery:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
