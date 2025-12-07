import { Router } from "express";
import * as deliverycontroller from "../Controllers/delivery.controller";

export const registerDeliveryRoutes = (app: any) => {
     app.post("/deliveries", deliverycontroller.scheduleDelivery); 
    app.get("/deliveries", deliverycontroller.getAllDeliveries);
    app.get("/deliveries/:id", deliverycontroller.getDeliveryById);     
    app.put("/deliveries/:id", deliverycontroller.updateDelivery);
    app.delete("/deliveries/:id", deliverycontroller.deleteDelivery);

};
