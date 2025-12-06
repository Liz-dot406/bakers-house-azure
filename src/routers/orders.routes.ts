import * as ordersController from "../Controllers/orders.controler";

const registerOrderRoutes = (app: any) => {
  app.get("/orders", ordersController.getOrders);
  app.get("/orders/:id", ordersController.getOrderById);
  app.post("/orders", ordersController.createOrder);

  // Update order status
  app.patch("/orders/:id", ordersController.updateOrderStatus);

  // Update order details (corrected path)
  app.patch("/orders/:id/details", ordersController.updateOrderDetails);


  // Delete an order
  app.delete("/orders/:id", ordersController.deleteOrder);

  // Get orders for a specific user (corrected path)
  app.get("/orders/user/:userid", ordersController.fetchOrdersofUser);
};

export default registerOrderRoutes;
