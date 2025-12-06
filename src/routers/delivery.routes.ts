import { Router } from "express";
import * as deliveryController from "../Controllers/delivery.controller";

const router = Router();

// All delivery routes
router.get("/", deliveryController.getAllDeliveries);
router.get("/:id", deliveryController.getDeliveryById);
router.post("/", deliveryController.scheduleDelivery);
router.put("/:id", deliveryController.updateDelivery);
router.delete("/:id", deliveryController.deleteDelivery);

export default router;
