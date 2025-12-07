import * as DeliveryRepo from "../repositories/deliveries.repository";
import { Delivery, DeliveryUpdate } from "../types/delivery.types";

export const getAllDeliveries = async () => {
  return await DeliveryRepo.getAllDeliveries();
};
export const getDeliveryById = async (DeliveryID: number) => {
  return await DeliveryRepo.getDeliveryById(DeliveryID);
};

export const scheduleDelivery = async (delivery: Delivery) => {
  return await DeliveryRepo.createDelivery(delivery);
};

export const updateDelivery = async (DeliveryID: number, delivery: DeliveryUpdate) => {
  const existing = await DeliveryRepo.getDeliveryById(DeliveryID);
  if (!existing) throw new Error("Delivery not found");
  return await DeliveryRepo.updateDelivery(DeliveryID, delivery);
};

export const deleteDelivery = async (DeliveryID: number) => {
  const existing = await DeliveryRepo.getDeliveryById(DeliveryID);
  if (!existing) throw new Error("Delivery not found");
  return await DeliveryRepo.deleteDelivery(DeliveryID);
};
