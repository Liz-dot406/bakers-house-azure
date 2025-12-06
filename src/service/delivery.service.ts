import * as DeliveryRepository from "../repositories/deliveries.repository";
import { Delivery } from "../types/delivery.types";

export const DeliveryService = {
  async getAll() {
    return await DeliveryRepository.getAllDeliveries();
  },

  async getById(id: number) {
    const delivery = await DeliveryRepository.getDeliveryById(id);
    if (!delivery) throw new Error("Delivery not found");
    return delivery;
  },

  async create(data: Delivery) {
    await DeliveryRepository.createDelivery(data);
  },

  async update(id: number, data: Delivery) {
    await DeliveryRepository.updateDelivery(id, data);
  },

  async delete(id: number) {
    await DeliveryRepository.deleteDelivery(id);
  },
};
